// === controllers/products.js ===
import db from '../db/connection.js'
import { z } from 'zod'
import crypto from 'crypto'

// --- 驗證（僅開放規格允許的欄位） ---
const updateSchema = z.object({
  name: z.string().min(1).max(100),          // products.name
  price: z.coerce.number().int().nonnegative(), // products.price (INT)
  colorCode: z.string().min(1).max(10),      // products.color_code -> 由 colors.code 來
  description: z.string().max(2000).optional().default('') // products.description
})

// --- 匯入（保留） ---
export const importProducts = async (req, res) => {
  res.json({ message: '匯入商品成功（TODO: 解析 Excel）' })
}

// --- 列表（分頁 + 20/40/60/80/100） ---
export const getProducts = async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1)
  const allowed = [20, 40, 60, 80, 100]
  const ask = parseInt(req.query.pageSize || '20', 10)
  const pageSize = allowed.includes(ask) ? ask : 20
  const offset = (page - 1) * pageSize

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM products`)

  // 依既有 schema 欄位與關聯查出列表顯示所需欄位
  const [rows] = await db.query(
    `
    SELECT
      p.id, p.code, p.name, p.price, p.description,
      p.initial_stock_date, p.initial_stock_qty, p.current_stock_qty,
      p.image_path,
      p.color_code,
      c.name AS color_name,
      lg.name AS big_category_name,
      /* 取多個中分類名稱（若有） */
      (
        SELECT GROUP_CONCAT(cm.name ORDER BY cm.name SEPARATOR ',')
        FROM product_categories_md pcm
        JOIN categories_md cm ON cm.id = pcm.category_md_id
        WHERE pcm.product_id = p.id
      ) AS mid_category_name,
      /* 是否已完成圖文雙向量（有一個缺就算未完成） */
      IF(pv.product_id IS NULL OR pv.image_vector IS NULL OR pv.text_vector IS NULL, 0, 1) AS vectorized
    FROM products p
    LEFT JOIN colors c ON c.code = p.color_code
    LEFT JOIN categories_lg lg ON lg.id = p.category_lg_id
    LEFT JOIN product_vectors pv ON pv.product_id = p.id
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
    `,
    [pageSize, offset]
  )

  res.json({ items: rows, total, page, pageSize })
}

// --- 取得顏色清單（供編輯下拉） ---
export const getColors = async (_req, res) => {
  const [rows] = await db.query(`SELECT code, name FROM colors ORDER BY name ASC`)
  res.json(rows)
}

// --- 更新（僅允許：name, price, color_code, description） ---
export const updateProduct = async (req, res) => {
  const { id } = req.params
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: '資料不合法', issues: parsed.error.issues })
  }
  const { name, price, colorCode, description } = parsed.data

  // 檢查 color 是否存在（避免 FK 失敗）
  const [[color]] = await db.query(`SELECT 1 FROM colors WHERE code=?`, [colorCode])
  if (!color) return res.status(400).json({ message: '顏色代碼不存在' })

  const [ret] = await db.query(
    `UPDATE products
     SET name=?, price=?, color_code=?, description=?
     WHERE id=?`,
    [name, price, colorCode, description || '', id]
  )
  if (ret.affectedRows === 0) return res.status(404).json({ message: '商品不存在' })
  res.json({ message: '更新成功' })
}

// --- 刪除（FK 多表已設 ON DELETE CASCADE） ---
export const deleteProduct = async (req, res) => {
  const [ret] = await db.query(`DELETE FROM products WHERE id=?`, [req.params.id])
  if (ret.affectedRows === 0) return res.status(404).json({ message: '商品不存在' })
  res.json({ message: '已刪除' })
}

// === 向量化相關（以 JSON 存入 product_vectors；與你 schema 一致） ===

// 單筆向量化
export const vectorizeOne = async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ message: '缺少正確的商品 ID' })

  const [[p]] = await db.query(`SELECT id, description, image_path FROM products WHERE id=?`, [id])
  if (!p) return res.status(404).json({ message: '商品不存在' })

  const textVec = await embedText(p.description || '')
  const imageVec = await embedImage(p.image_path || 'no-image')

  await upsertVectors(id, imageVec, textVec)
  res.json({ message: '向量化完成', count: 1 })
}

// 批次向量化（勾選／全選）
export const vectorizeMany = async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Boolean) : []
  if (ids.length === 0) return res.status(400).json({ message: '請提供 ids 陣列' })

  const [rows] = await db.query(
    `SELECT id, description, image_path FROM products WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids
  )
  if (rows.length === 0) return res.status(404).json({ message: '找不到商品' })

  for (const p of rows) {
    const textVec = await embedText(p.description || '')
    const imageVec = await embedImage(p.image_path || 'no-image')
    await upsertVectors(p.id, imageVec, textVec)
  }
  res.json({ message: '批次向量化完成', count: rows.length })
}

// 存入/更新向量（JSON 格式，對齊你的 schema）
async function upsertVectors(productId, imageVec, textVec) {
  await db.query(
    `
    INSERT INTO product_vectors (product_id, image_vector, text_vector)
    VALUES (?, CAST(? AS JSON), CAST(? AS JSON))
    ON DUPLICATE KEY UPDATE
      image_vector = VALUES(image_vector),
      text_vector = VALUES(text_vector)
    `,
    [productId, JSON.stringify(imageVec), JSON.stringify(textVec)]
  )
}

// 產生穩定的「假向量」：可立即跑通全流程；之後要接 OpenAI/CLIP 再替換
async function embedText(text) {
  return pseudoEmbedding(text, 512)
}
async function embedImage(seed) {
  // 可改為：讀檔 hash、或丟給圖像嵌入服務；此處用 deterministic 假向量
  return pseudoEmbedding(seed, 512)
}
function pseudoEmbedding(seed, dims) {
  const out = []
  let key = Buffer.from(crypto.createHash('sha256').update(String(seed)).digest())
  for (let i = 0; i < dims; i++) {
    if (i % 32 === 0) key = Buffer.from(crypto.createHash('sha256').update(key).digest())
    out.push((key[i % 32] / 255) * 2 - 1) // [-1, 1]
  }
  return out
}

// --- 保留其他端點（模擬） ---
export const cluster = async (_req, res) => res.json({ message: '分群完成（模擬）' })
export const potential = async (_req, res) => res.json({ message: '潛力計算完成（模擬）' })
export const report = async (_req, res) => res.json({ message: '報表已產出（模擬）' })

// === controllers/products.js ===
/*
import { pool } from '../db.js'
export const importProducts = async (req, res) => {
  res.json({ message: '匯入商品成功（TODO: 解析 Excel）' })
}
export const getProducts = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products')
  res.json(rows)
}
export const updateProduct = async (req, res) => {
  const { id } = req.params
  const { name, price } = req.body
  await pool.query('UPDATE products SET name=?, price=? WHERE id=?', [name, price, id])
  res.json({ message: '更新成功' })
}
export const deleteProduct = async (req, res) => {
  await pool.query('DELETE FROM products WHERE id=?', [req.params.id])
  res.json({ message: '已刪除' })
}
export const vectorize = async (req, res) => {
  res.json({ message: '向量化完成（模擬）' })
}
export const cluster = async (req, res) => {
  res.json({ message: '分群完成（模擬）' })
}
export const potential = async (req, res) => {
  res.json({ message: '潛力計算完成（模擬）' })
}
export const report = async (req, res) => {
  res.json({ message: '報表已產出（模擬）' })
}
  */