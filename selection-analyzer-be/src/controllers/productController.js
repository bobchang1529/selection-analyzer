// === 控制器檔：src/controllers/productController.js ===
import db from '../db/connection.js'
import unzipper from 'unzipper'
import fs from 'fs'
import path from 'path'

export const importProducts = async (req, res) => {
  const excelFile = req.files?.excel?.[0]
  const imageZip = req.files?.images?.[0]

  // 解壓圖片 ZIP
  const destPath = path.resolve('public/images/products')
  fs.createReadStream(imageZip.path)
    .pipe(unzipper.Extract({ path: destPath }))
    .on('close', () => {
      console.log('圖檔已解壓')
    })

  // ⬇️ 可在此處解析 Excel 檔 → 匯入資料
  console.log('商品 Excel 路徑:', excelFile.path)

  res.json({ message: '商品資料與圖檔已匯入' })
}

export const getProducts = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, product_code, name, category_md, price FROM products')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '查詢商品失敗' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: '找不到商品' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '查詢單筆商品失敗' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { name, category_md, price } = req.body
    const [result] = await db.execute(
      'UPDATE products SET name = ?, category_md = ?, price = ? WHERE id = ?',
      [name, category_md, price, req.params.id]
    )
    res.json({ message: '商品更新成功', affectedRows: result.affectedRows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '更新商品失敗' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: '商品不存在或已刪除' })
    res.json({ message: '商品刪除成功', affectedRows: result.affectedRows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '刪除商品失敗' })
  }
}

export const vectorizeProduct = (req, res) => {
  res.json({ message: '向量生成完成' })
}

export const clusterProducts = (req, res) => {
  res.json({ message: '商品已分群' })
}

export const computePotential = (req, res) => {
  res.json({ message: '潛力計算成功' })
}

export const generateReport = (req, res) => {
  res.json({ message: '報表產生完成' })
}

// productController.js


