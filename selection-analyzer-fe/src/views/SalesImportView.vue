// ✅ 前端頁面：src/views/SalesImportView.vue
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-4">匯入銷售資料（Excel）</h2>
    <input type="file" @change="handleFile" accept=".xlsx" class="mb-4" />
    <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">上傳</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const file = ref(null)

function handleFile(e) {
  file.value = e.target.files[0]
}

async function submit() {
  if (!file.value) {
    alert('請選擇檔案')
    return
  }
  const form = new FormData()
  form.append('file', file.value)
  await axios.post('http://localhost:3000/api/sales/import', form)
  alert('匯入完成')
}
</script>
