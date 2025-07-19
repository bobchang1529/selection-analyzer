// === 主伺服器：src/index.js ===
import express from 'express'
import cors from 'cors'
import productRoutes from './routes/productRoutes.js'
import salesRoutes from './routes/salesRoutes.js'

const app = express()
const port = 3000
app.use('/images', express.static('public/images'))

app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)

app.listen(port, () => {
  console.log(`✅ 選品潛力分析器 API 伺服器啟動中：http://localhost:${port}`)
})
