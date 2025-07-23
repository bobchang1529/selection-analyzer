
<template>
  <div class="p-8 pt-4 text-sm text-gray-700 font-sans">
    <h1 class="text-lg font-semibold mb-6 tracking-wide">匯入銷售資料</h1>

    <form @submit.prevent="submitForm" class="max-w-3xl ml-4 rounded p-6">
      <!-- 銷售資料 -->
      <div class="mb-6 flex items-center">
        <label class="w-24 text-sm text-gray-700 mr-2 text-right">銷售資料:</label>
        <input
          type="file"
          accept=".xlsx"
          @change="handleFileChange"
          class="border border-gray-300 px-3 py-1 rounded text-sm"
        />
        <span class="ml-2 text-xs text-gray-500">(Excel .xlsx)</span>
      </div>

      <!-- 上傳按鈕 -->
      <div class="flex justify-center mt-6">
        <button
          type="submit"
          class="bg-gray-100 text-gray-700 text-sm px-6 py-2 rounded hover:bg-gray-200 transition"
        >
          上傳
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const salesFile = ref<File | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  salesFile.value = target.files?.[0] || null
}

const submitForm = () => {
  if (!salesFile.value) {
    alert('請選擇檔案')
    return
  }

  const formData = new FormData()
  formData.append('sales', salesFile.value)

  // TODO: 改為實際 API 呼叫
  alert('模擬上傳成功')
}
</script>
