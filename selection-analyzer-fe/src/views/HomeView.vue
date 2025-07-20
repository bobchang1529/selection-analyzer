<template>
  <div class="flex flex-col min-h-screen">
    <!-- 選單區：Header -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow px-6 py-3 flex items-center justify-between z-50">
      <h1 class="text-lg font-bold text-gray-800">選品潛力分析器</h1>
      <nav class="flex space-x-3">
        <button @click="goToUpload" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          匯入商品資料
        </button>
        <button @click="goToSalesImport" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          匯入銷售資料
        </button>
        <button @click="goToProducts" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          查詢商品資料
        </button>
        <button @click="goToSales" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          查詢銷售資料
        </button>
        <button @click="goToReport" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded">
          查看潛力報告
        </button>
      </nav>
    </header>

    <!-- 工作區 -->
    <main class="pt-20 flex-grow bg-white">
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
  router.push('/sales-import')
}
function goToProducts() {
  router.push('/products')
}
function goToSales() {
  router.push('/sales-view')
}
function goToReport() {
  router.push('/report')
}
</script>
