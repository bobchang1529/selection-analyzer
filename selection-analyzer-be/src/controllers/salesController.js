// === 銷售控制器檔：src/controllers/salesController.js ===
import db from '../db/connection.js'

export const getSalesRecords = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, p.product_code, s.week, s.units_sold, s.sales_amount
       FROM sales_records s
       JOIN products p ON s.product_id = p.id
       ORDER BY s.week, p.product_code`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '查詢銷售資料失敗' })
  }
}