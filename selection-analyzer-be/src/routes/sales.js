// === routes/sales.js ===
import express from 'express'
import multer from 'multer'
import * as ctrl from '../controllers/sales.js'
const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/import', upload.single('file'), ctrl.importSales)
export default router