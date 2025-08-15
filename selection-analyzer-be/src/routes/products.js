// === routes/products.js ===
import express from 'express'
import multer from 'multer'

// 其餘產品 API（列表/更新/刪除/顏色/向量化/分群/潛力/報表）
import * as ctrl from '../controllers/products.js'

// 匯入商品資料（完整 Excel + 圖片 zip 流程）
import { importProducts as importProductsFull } from '../controllers/productController.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

/**
 * 匯入（同時支援 Excel + 圖片壓縮檔）
 * 允許以下欄位名稱（兼容舊版前端）：
 * - Excel：excel 或 file
 * - 圖片壓縮檔：images 或 imageZip 或 zip
 * 正規化後一律提供給控制器：req.files.excel[0], req.files.images[0]
 */
router.post(
  '/import',
  upload.fields([
    { name: 'excel',   maxCount: 1 },
    { name: 'file',    maxCount: 1 }, // 兼容舊欄位名
    { name: 'images',  maxCount: 1 },
    { name: 'imageZip',maxCount: 1 }, // 兼容舊欄位名
    { name: 'zip',     maxCount: 1 }, // 兼容舊欄位名
  ]),
  (req, _res, next) => {
    // 將別名正規化成 excel / images，給控制器統一取用
    req.files = req.files || {}
    if (!req.files.excel && req.files.file) {
      req.files.excel = req.files.file
    }
    if (!req.files.images && (req.files.imageZip || req.files.zip)) {
      req.files.images = req.files.imageZip || req.files.zip
    }
    next()
  },
  importProductsFull
)

// 列表（分頁）
router.get('/', ctrl.getProducts)

// 更新
router.put('/:id', ctrl.updateProduct)

// 刪除
router.delete('/:id', ctrl.deleteProduct)

// 取得顏色清單
router.get('/colors', ctrl.getColors)

// 單筆向量化
router.post('/:id/vectorize', ctrl.vectorizeOne)

// 批次向量化
router.post('/vectorize', ctrl.vectorizeMany)

// 分群 / 潛力分析 / 報表
router.post('/cluster', ctrl.cluster)
router.post('/potential', ctrl.potential)
router.get('/report', ctrl.report)

export default router
