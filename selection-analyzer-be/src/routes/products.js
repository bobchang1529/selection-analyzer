// === routes/products.js ===
import express from 'express'
import multer from 'multer'
import * as ctrl from '../controllers/products.js'
const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/import', upload.single('file'), ctrl.importProducts)
router.get('/', ctrl.getProducts)
router.put('/:id', ctrl.updateProduct)
router.delete('/:id', ctrl.deleteProduct)
router.post('/vectorize', ctrl.vectorize)
router.post('/cluster', ctrl.cluster)
router.post('/potential', ctrl.potential)
router.get('/report', ctrl.report)

export default router