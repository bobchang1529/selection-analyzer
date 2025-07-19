// === 上傳頁元件：src/views/UploadView.vue ===
<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">匯入商品資料與圖片</h2>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">選擇商品資料檔（Excel .xlsx）</label>
      <input type="file" @change="handleExcelFile" />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">選擇商品圖片檔（ZIP 壓縮）</label>
      <input type="file" @change="handleImageZip" />
    </div>

    <button @click="submitFiles" class="bg-blue-600 text-white px-4 py-2 rounded">上傳</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const excelFile = ref(null)
const imageZip = ref(null)

function handleExcelFile(e) {
  excelFile.value = e.target.files[0]
}

function handleImageZip(e) {
  imageZip.value = e.target.files[0]
}

async function submitFiles() {
  if (!excelFile.value || !imageZip.value) {
    alert('請同時選擇資料檔與圖片檔')
    return
  }

  const formData = new FormData()
  formData.append('excel', excelFile.value)
  formData.append('images', imageZip.value)

  await axios.post('http://localhost:3000/api/products/import', formData)
  alert('匯入完成')
}
</script>
