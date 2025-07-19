// === 首頁元件：src/views/HomeView.vue ===
<template>
  <div class="p-6 text-center">
    <h1 class="text-3xl font-bold mb-4">選品潛力分析器</h1>
    <div class="space-y-4">
      <button @click="goToUpload" class="bg-blue-500 text-white px-4 py-2 rounded">匯入商品資料</button>
      <button @click="goToReport" class="bg-green-500 text-white px-4 py-2 rounded">查看潛力報告</button>
      <button @click="goToProducts" class="bg-indigo-500 text-white px-4 py-2 rounded">查詢商品資料</button>
      <button @click="goToSales" class="bg-purple-500 text-white px-4 py-2 rounded">檢視銷售資料</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToUpload() {
  router.push('/upload')
}

function goToReport() {
  router.push('/report')
}

function goToProducts() {
  router.push('/products')
}

function goToSales() {
  router.push('/sales-view')
}
</script>