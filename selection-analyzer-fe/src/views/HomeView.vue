// === 首頁元件：src/views/HomeView.vue ===
<template>
  <div class="flex flex-col min-h-screen">
    <!-- 選單區固定置頂 -->
    <nav class="sticky top-0 z-50 bg-white shadow p-4">
      <h1 class="text-2xl font-bold mb-2 text-center">選品潛力分析器</h1>
      <div class="flex flex-wrap justify-center gap-4">
        <button @click="goToUpload" class="fancy-button">匯入商品資料</button>
        <button @click="goToSalesImport" class="fancy-button">匯入銷售資料</button>
        <button @click="goToList" class="fancy-button">查詢商品資料</button>
        <button @click="goToSales" class="fancy-button">查詢銷售資料</button>
        <button @click="goToReport" class="fancy-button">查看潛力報告</button>
      </div>
    </nav>

    <!-- 工作區 -->
    <main class="flex-grow bg-white text-black p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToUpload() {
  router.push('/upload')
}

function goToSalesImport() {
  router.push('/sales/import')
}

function goToList() {
  router.push('/products')
}

function goToSales() {
  router.push('/sales')
}

function goToReport() {
  router.push('/report')
}
</script>

<style scoped>
.fancy-button {
  @apply bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-600 transition duration-300;
  min-width: 160px;
}
</style>
