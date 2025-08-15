

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-4">匯入商品資料與圖片</h2>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">📄 商品資料檔（Excel .xlsx）</label>
      <input type="file" @change="handleExcel" accept=".xlsx" />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">🖼️ 商品圖檔（ZIP 壓縮）</label>
      <input type="file" @change="handleZip" accept=".zip" />
    </div>

    <button
      @click="submitFiles"
      class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      :disabled="isUploading"
    >
      {{ isUploading ? '匯入中...' : '開始匯入' }}
    </button>

    <div class="mt-4 text-green-600" v-if="successMsg">{{ successMsg }}</div>
    <div class="mt-4 text-red-600" v-if="errorMsg">{{ errorMsg }}</div>
  </div>
  <div v-if="successMsg" class="text-green-600 mt-2">
    ✅ 匯入成功！請確認資料是否正確。
    <div v-if="errorFile && errorFile !== ''">
      ⚠️ 有資料匯入失敗，<a :href="`http://localhost:3000${errorFile}`" download class="text-blue-600 underline">點我下載錯誤記錄</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const excel = ref(null);
const zip = ref(null);
const isUploading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const errorFile = ref(null);

function handleExcel(e) {
  excel.value = e.target.files[0];
  console.log('📁 Excel 檔案選取:', excel.value?.name);
}

function handleZip(e) {
  zip.value = e.target.files[0];
  console.log('📁 圖片壓縮檔選取:', zip.value?.name);
}

async function submitFiles() {
  successMsg.value = '';
  errorMsg.value = '';
  errorFile.value = '';
  isUploading.value = true;
  console.log('🚀 開始上傳檔案...');

  if (!excel.value || !zip.value) {
    errorMsg.value = '請選擇 Excel 與圖片 zip 檔案';
    errorMsg.value = '請選擇 Excel 與圖片 zip 檔案 from Bob3';
    isUploading.value = false;
    return;
  }

  try {
    const form = new FormData();
    form.append('excel', excel.value);
    form.append('images', zip.value);

    const res = await axios.post('http://localhost:3000/api/products/import', form);
    successMsg.value = res.data.message || '匯入成功';
    errorFile.value = res.data.errorFile || null;
    console.log('✅ 匯入成功:', res.data.message);
  } catch (err) {
    console.error('❌ 匯入失敗:', err);
    errorMsg.value = err?.response?.data?.error || '匯入失敗，請確認資料格式或伺服器連線';
  } finally {
    isUploading.value = false;
    excel.value = null;
    zip.value = null;
  }
}
</script>
