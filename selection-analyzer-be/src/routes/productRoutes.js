
// === 路由檔：src/routes/productRoutes.js ===
import express from 'express'
import multer from 'multer'
import {
  importProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  vectorizeProduct,
  clusterProducts,
  computePotential,
  generateReport
} from '../controllers/productController.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/import', upload.fields([
  { name: 'excel', maxCount: 1 },
  { name: 'images', maxCount: 1 }
]), importProducts)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)
router.post('/vectorize', vectorizeProduct)
router.post('/cluster', clusterProducts)
router.post('/potential', computePotential)
router.get('/report', generateReport)

export default router

// productRoutes.js
