import pool from '../db/connection.js';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

function excelDateToString(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

// 嘗試從資料夾找出對應商品代號的圖片，支援多種副檔名
function findProductImageRelPath(dirAbs, code) {
  const exts = ['.avif', '.webp', '.jpg', '.jpeg', '.png'];
  for (const ext of exts) {
    const abs = path.join(dirAbs, `${code}${ext}`);
    if (fs.existsSync(abs)) {
      // 專案對外路徑（public 下）
      return `/images/products/${code}${ext}`;
    }
  }
  return null;
}

export const importProducts = async (req, res) => {
  const file = req.files?.excel?.[0];
  const zipFile = req.files?.images?.[0];
  const errors = [];

  if (!file) return res.status(400).send({ error: '❌ 沒有上傳 Excel 檔案' });

  // 1) 解壓圖片 zip
  let imagesDirAbs = path.join(process.cwd(), 'public', 'images', 'products');
  try {
    if (zipFile) {
      fs.mkdirSync(imagesDirAbs, { recursive: true });
      await fs.createReadStream(zipFile.path)
        .pipe(unzipper.Extract({ path: imagesDirAbs }))
        .promise();
    } else {
      fs.mkdirSync(imagesDirAbs, { recursive: true });
    }
  } catch (e) {
    return res.status(500).send({ error: `解壓圖片失敗：${e.message}` });
  }

  // 2) 讀取 Excel
  const workbook = xlsx.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  // 預先整理需要的欄位名稱
  const requiredFieldsList = [
    '商品代號', '商品名稱', '商品價格', '商品描述', '商品顏色',
    '商品主要成份', '商品大分類', '商品中分類', '進貨日期',
    '期初庫存', '期末庫存'
  ];

  for (const row of data) {
    const {
      商品代號: product_code,
      商品名稱: name,
      商品價格: priceStrRaw,
      商品描述: description,
      商品顏色: colorRaw,
      商品主要成份: materialRaw,
      商品大分類: lgCategoryName,
      商品中分類: mdCategoryRaw,
      進貨日期: initialDateRaw,
      期初庫存: initialQtyRaw,
      期末庫存: currentQtyRaw,
    } = row;

    // 2-1) 必填檢查（空白就記錯並跳過）
    let skipRow = false;
    for (const fieldName of requiredFieldsList) {
      const v = row[fieldName];
      if (v === undefined || v === null || String(v).trim() === '') {
        errors.push({ row, error: `${fieldName} 不得為空白` });
        skipRow = true;
      }
    }
    if (skipRow) continue;

    // 2-2) 價格/庫存驗證，允許來源為 number 或 string
    const priceStr = String(priceStrRaw);
    const initialQtyStr = String(initialQtyRaw);
    const currentQtyStr = String(currentQtyRaw);

    if (!/^\d+$/.test(priceStr)) {
      errors.push({ row, error: `價格格式錯誤: ${priceStrRaw}` });
      continue;
    }
    if (!/^\d+$/.test(initialQtyStr)) {
      errors.push({ row, error: `期初庫存格式錯誤: ${initialQtyRaw}` });
      continue;
    }
    if (!/^\d+$/.test(currentQtyStr)) {
      errors.push({ row, error: `期末庫存格式錯誤: ${currentQtyRaw}` });
      continue;
    }
    const price = parseInt(priceStr, 10);
    const initialQty = parseInt(initialQtyStr, 10);
    const currentQty = parseInt(currentQtyStr, 10);

    // 2-3) 顏色格式驗證
    if (typeof colorRaw !== 'string' || !colorRaw.includes(':')) {
      errors.push({ row, error: `商品顏色格式錯誤: ${colorRaw}` });
      continue;
    }
    const [colorCodeRaw, colorNameRaw] = colorRaw.split(':').map(s => s.trim());
    if (!colorCodeRaw || !colorNameRaw) {
      errors.push({ row, error: `商品顏色格式錯誤: ${colorRaw}` });
      continue;
    }

    // 2-4) 中分類格式驗證
    if (typeof mdCategoryRaw !== 'string' || !/^[^/]+(\/[^/]+)*$/.test(mdCategoryRaw.trim())) {
      errors.push({ row, error: `商品中分類格式錯誤: ${mdCategoryRaw}` });
      continue;
    }
    const mdList = mdCategoryRaw.split('/').map(s => s.trim()).filter(Boolean);

    // 2-5) 日期處理（Excel 序號 or YYYY/MM/DD or YYYY-MM-DD）
    let formattedDate = null;
    if (typeof initialDateRaw === 'number') {
      formattedDate = excelDateToString(initialDateRaw);
    } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(String(initialDateRaw))) {
      formattedDate = String(initialDateRaw).replace(/\//g, '-');
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(initialDateRaw))) {
      formattedDate = String(initialDateRaw);
    }
    if (!formattedDate) {
      errors.push({ row, error: `進貨日期格式錯誤: ${initialDateRaw}` });
      continue;
    }

    // 2-6) 成分解析（格式：材質 80%）
    const parsedMaterials = [];
    if (typeof materialRaw === 'string' && materialRaw.trim() !== '') {
      for (const part of materialRaw.split(',').map(p => p.trim()).filter(Boolean)) {
        const m = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
        if (!m) {
          errors.push({ row, error: `成份格式錯誤: ${part}` });
          // 不直接跳過整列，讓其它正確項目可進，但最後仍會留下錯誤報告
          continue;
        }
        parsedMaterials.push({ name: m[1].trim(), pct: parseFloat(m[2]) });
      }
    }

    // 3) 逐列交易處理
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 3-1) 產品主檔（圖片路徑先偵測）
      const imageRelPath = findProductImageRelPath(imagesDirAbs, product_code);
      await conn.query(
        `INSERT INTO products 
          (code, name, price, description, color_code, category_lg_id, initial_stock_date, initial_stock_qty, current_stock_qty, image_path)
         VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name=VALUES(name), price=VALUES(price), description=VALUES(description),
           initial_stock_date=VALUES(initial_stock_date),
           initial_stock_qty=VALUES(initial_stock_qty), current_stock_qty=VALUES(current_stock_qty),
           image_path=VALUES(image_path)`,
        [product_code, name, price, description || '', formattedDate, initialQty, currentQty, imageRelPath]
      );

      const [[product]] = await conn.query(`SELECT id FROM products WHERE code=?`, [product_code]);
      const productId = product.id;

      // 3-2) 顏色
      const [[colorExists]] = await conn.query(`SELECT code FROM colors WHERE code=?`, [colorCodeRaw]);
      if (!colorExists) {
        await conn.query(`INSERT INTO colors (code, name) VALUES (?, ?)`, [colorCodeRaw, colorNameRaw]);
      }
      await conn.query(`UPDATE products SET color_code=? WHERE id=?`, [colorCodeRaw, productId]);

      // 3-3) 大分類
      let lgCatId;
      const [[lg]] = await conn.query(`SELECT id FROM categories_lg WHERE name=?`, [lgCategoryName]);
      if (!lg) {
        const [ins] = await conn.query(`INSERT INTO categories_lg (name) VALUES (?)`, [lgCategoryName]);
        lgCatId = ins.insertId;
      } else {
        lgCatId = lg.id;
      }
      await conn.query(`UPDATE products SET category_lg_id=? WHERE id=?`, [lgCatId, productId]);

      // 3-4) 中分類（同步：新增缺的 + 移除多餘）
      const mdIdsThisRound = [];
      for (const mdName of mdList) {
        const [[md]] = await conn.query(`SELECT id FROM categories_md WHERE name=?`, [mdName]);
        let mdId = md?.id;
        if (!mdId) {
          const [ins] = await conn.query(`INSERT INTO categories_md (name) VALUES (?)`, [mdName]);
          mdId = ins.insertId;
        }
        mdIdsThisRound.push(mdId);

        // MD 不可同時掛到其他 LG（若已掛到不同 LG 視為錯誤）
        //const [conflicts] = await conn.query(
          //`SELECT lg_id FROM category_relations WHERE md_id=? AND lg_id<>?`,
          //[mdId, lgCatId]
        //);
        //if (conflicts.length > 0) {
          //errors.push({ row, error: `商品大分類與中分類關係錯誤：${lgCategoryName} / ${mdName}` });
          // 不 rollback，照樣讓其它列能跑，但這一列資料維持既有關聯，不強行變更
          //continue;
        //}

        // 建立 LG-MD 關聯（若不存在）
        await conn.query(
          `INSERT IGNORE INTO category_relations (lg_id, md_id) VALUES (?, ?)`,
          [lgCatId, mdId]
        );

        // 產品-中分類 關聯（若不存在）
        await conn.query(
          `INSERT IGNORE INTO product_categories_md (product_id, category_md_id) VALUES (?, ?)`,
          [productId, mdId]
        );
      }
      // 移除這次沒出現的 MD 關聯
      if (mdIdsThisRound.length > 0) {
        const ph = mdIdsThisRound.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM product_categories_md 
           WHERE product_id=? AND category_md_id NOT IN (${ph})`,
          [productId, ...mdIdsThisRound]
        );
      } else {
        // 若 mdList 完全無效，就不動舊關聯（錯誤已記錄）
      }

      // 3-5) 成份（同步）
      const materialIdsThisRound = [];
      for (const { name: matName, pct } of parsedMaterials) {
        const [[mat]] = await conn.query(`SELECT id FROM materials WHERE name=?`, [matName]);
        let matId = mat?.id;
        if (!matId) {
          const [ins] = await conn.query(`INSERT INTO materials (name) VALUES (?)`, [matName]);
          matId = ins.insertId;
        }
        materialIdsThisRound.push(matId);

        const [[exist]] = await conn.query(
          `SELECT id FROM product_materials WHERE product_id=? AND material_id=?`,
          [productId, matId]
        );
        if (!exist) {
          await conn.query(
            `INSERT INTO product_materials (product_id, material_id, percentage) VALUES (?, ?, ?)`,
            [productId, matId, pct]
          );
        } else {
          await conn.query(
            `UPDATE product_materials SET percentage=? WHERE product_id=? AND material_id=?`,
            [pct, productId, matId]
          );
        }
      }
      if (materialIdsThisRound.length > 0) {
        const ph = materialIdsThisRound.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM product_materials 
           WHERE product_id=? AND material_id NOT IN (${ph})`,
          [productId, ...materialIdsThisRound]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      errors.push({ row, error: `匯入失敗 [${row?.商品代號 ?? '未知代號'}]: ${err.message}` });
    } finally {
      conn.release();
    }
  }

  // 4) 回應：若有錯誤，輸出錯誤 Excel 供下載
  if (errors.length > 0) {
    const errorSheet = xlsx.utils.json_to_sheet(
      errors.map(e => ({ ...e.row, 錯誤訊息: e.error }))
    );
    const errorWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(errorWorkbook, errorSheet, 'Errors');

    const timestamp = Date.now();
    const errorDir = path.join(process.cwd(), 'public', 'errors');
    fs.mkdirSync(errorDir, { recursive: true });
    const errorFilePath = path.join(errorDir, `error_${timestamp}.xlsx`);

    const buffer = xlsx.write(errorWorkbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(errorFilePath, buffer);

    return res.send({
      message: '部分資料匯入失敗',
      errorFile: `/errors/error_${timestamp}.xlsx`,
    });
  }

  res.send({ message: '✅ 匯入完成' });
};
