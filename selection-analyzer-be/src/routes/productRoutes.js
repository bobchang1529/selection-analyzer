
import express from 'express';
import multer from 'multer';
import { importProducts } from '../controllers/productController.js';
console.log('3. BE->productRoutes,js: import productController.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
console.log('4. BE->productRoutes.js: post methord impl');  // ✅ 模組載入時執行
router.post(
  '/import',
  upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'images', maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log('Router triggered: 路由被觸發時印出');  // ✅ 路由被觸發時印出
    console.log('✅ 收到上傳請求');
    next();
  },
  importProducts
);

export default router;
