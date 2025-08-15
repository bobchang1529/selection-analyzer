// === 主伺服器：src/index.js ===
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// 只保留合併後的 products 路由
import productsRouter from './routes/products.js'
import salesRoutes from './routes/salesRoutes.js'

console.log('1. BE->index.js: import express, cors, productsRouter, salesRoutes')

// 初始化 Express（一定要在任何 app.use 之前）
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const port = 3000

// 中介層
app.use(cors())
app.use(express.json())

// 靜態資源
app.use('/uploads', express.static('uploads'))                 // 上傳檔案（Excel/圖片）
app.use('/errors', express.static(path.join(__dirname, '../public/errors')))
app.use('/images', express.static(path.join(__dirname, '../public/images')))

// 路由
app.use('/api/products', productsRouter)
app.use('/api/sales', salesRoutes)

console.log('2. BE->index.js: use static, cors, json, productsRouter, salesRoutes')

// 啟動伺服器
app.listen(port, () => {
  console.log(`✅ 選品潛力分析器 API 伺服器啟動中：http://localhost:${port}`)
})
