

<template>
  <div class="p-8 pt-4">
    <h2 class="text-lg font-bold text-gray-800 mb-4">匯入商品資料與圖片</h2>

<form @submit.prevent="submit" class=" -gray-300 inline-block">
      <!-- 商品資料欄位 -->
      <div class="mb-4 flex items-center">
        <label for="productFile" class="w-20 text-sm text-gray-700 mr-1">商品資料:</label>         <input
          type="file"
          id="productFile"
          @change="handleProductFileChange"
          class="mr-2 border border-gray-300 text-sm px-2 py-1 rounded"
        />
        <span class="text-gray-400 text-xs">(Excel .xlsx)</span>
      </div>

      <!-- 商品圖片欄位 -->
      <div class="mb-4 flex items-center">
        <label for="imageFile" class="w-20 text-sm text-gray-700 mr-1">商品圖片:</label>         <input
          type="file"
          id="imageFile"
          @change="handleImageFileChange"
          class="mr-2 border border-gray-300 text-sm px-2 py-1 rounded"
        />
        <span class="text-gray-400 text-xs">(ZIP 壓縮)</span>
      </div>

      <!-- 提交按鈕 -->
      <div class="flex justify-center mt-6">
        <button
          type="submit"
          class="bg-gray-100 text-gray-700 text-sm px-6 py-2 rounded hover:bg-gray-200"
        >
          上傳
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const productFile = ref<File | null>(null)
const imageFile = ref<File | null>(null)

const handleProductFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    productFile.value = target.files[0]
  }
}

const handleImageFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    imageFile.value = target.files[0]
  }
}

const submit = () => {
  if (!productFile.value || !imageFile.value) {
    alert('請選擇商品資料與圖片檔案')
    return
  }

  const formData = new FormData()
  formData.append('productFile', productFile.value)
  formData.append('imageFile', imageFile.value)

  // 實際的上傳邏輯（例如使用 fetch 或 axios）
  alert('已準備好上傳')
}
</script>
