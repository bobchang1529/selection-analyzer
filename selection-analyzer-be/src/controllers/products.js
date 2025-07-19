// === controllers/products.js ===
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