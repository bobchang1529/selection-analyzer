// ✅ 選品潛力分析器 - 後端商品控制器（含匯入商品與銷售資料）
import db from '../db/connection.js'
import fs from 'fs'
import path from 'path'
import unzipper from 'unzipper'
import xlsx from 'xlsx'

export const importProducts = async (req, res) => {
  try {
    const excelFile = req.files?.excel?.[0]
    const imageZip = req.files?.images?.[0]

    if (imageZip) {
      const destPath = path.resolve('public/images/products')
      fs.createReadStream(imageZip.path)
        .pipe(unzipper.Extract({ path: destPath }))
        .on('close', () => {
          console.log('✅ 商品圖片已解壓')
        })
    }

    if (excelFile) {
      const workbook = xlsx.readFile(excelFile.path)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rawData = xlsx.utils.sheet_to_json(sheet)
      const data = rawData.map(row => ({
        product_code: row['商品代號'],
        name: row['商品名稱'],
        category_md: row['中分類'],
        price: row['價格']
      }))

      for (const item of data) {
        await db.query('INSERT INTO products SET ?', item)
      }
    }

    res.json({ message: '商品資料與圖檔已匯入' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '匯入商品資料時發生錯誤' })
  }
}

export const importSales = async (req, res) => {
  try {
    const filePath = req.file.path
    const workbook = xlsx.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet)

    for (const row of rows) {
      const [productRow] = await db.query(
        'SELECT id FROM products WHERE product_code = ?',
        [row['商品代號']]
      )
      if (!productRow[0]) continue

      await db.query(
        'INSERT INTO sales_records (product_id, week, units_sold, sales_amount) VALUES (?, ?, ?, ?)',
        [
          productRow[0].id,
          row['銷售週次'],
          row['銷售數量'],
          row['銷售金額']
        ]
      )
    }

    res.json({ message: '銷售資料已匯入成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '匯入銷售資料失敗' })
  } finally {
    fs.unlink(req.file.path, () => {})
  }
}

export const getSales = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, p.product_code, s.week, s.units_sold, s.sales_amount
      FROM sales_records s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.week ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '查詢銷售資料失敗' })
  }
}

export const getProducts = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products')
  res.json(rows)
}

export const getProductById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id])
  res.json(rows[0])
}

export const updateProduct = async (req, res) => {
  const { name, category_md, price } = req.body
  await db.query('UPDATE products SET name = ?, category_md = ?, price = ? WHERE id = ?', [name, category_md, price, req.params.id])
  res.json({ message: '商品已更新' })
}

export const deleteProduct = async (req, res) => {
  await db.query('DELETE FROM products WHERE id = ?', [req.params.id])
  res.json({ message: '商品已刪除' })
}

export const generateReport = async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.id, p.name, p.product_code,
      COALESCE(SUM(s.sales_amount), 0) AS total_sales,
      COALESCE(SUM(s.units_sold), 0) AS total_units,
      ROUND(COALESCE(SUM(s.units_sold), 0) * 1.5 + COALESCE(SUM(s.sales_amount), 0) * 0.001, 0) AS score
    FROM products p
    LEFT JOIN sales_records s ON p.id = s.product_id
    GROUP BY p.id
    ORDER BY score DESC
  `)
  res.json({ items: rows })
}
