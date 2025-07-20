// === 銷售路由檔：src/routes/salesRoutes.js ===
import express from 'express'
import { getSalesRecords } from '../controllers/salesController.js'

const router = express.Router()

router.get('/', getSalesRecords)

export default router

/*
// === 路由：src/routes/salesRoutes.js ===
import express from 'express'
import multer from 'multer'
import { importSales } from '../controllers/salesController.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/import', upload.single('file'), importSales)

export default router
*/