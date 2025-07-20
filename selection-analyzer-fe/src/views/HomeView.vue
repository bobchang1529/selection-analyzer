<template>
  <div class="min-h-screen flex flex-col">
    <!-- 選單列（置頂固定） -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow flex justify-between items-center px-6 py-3 z-50">
      <h1 class="text-lg font-bold text-gray-800">選品潛力分析器</h1>
      <nav class="flex space-x-2">
        <button @click="goToUpload" class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded">
          匯入商品資料
        </button>
        <button @click="goToSalesImport" class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded">
          匯入銷售資料
        </button>
        <button @click="goToProducts" class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded">
          查詢商品資料
        </button>
        <button @click="goToSales" class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded">
          查詢銷售資料
        </button>
        <button @click="goToReport" class="bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded">
          查看潛力報告
        </button>
      </nav>
    </header>

    <!-- 工作區（位於選單下方） -->
    <main class="pt-20 px-6 pb-6 flex-grow bg-white">
      <!-- 初始為空白畫面 -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToUpload = () => router.push('/upload')
const goToSalesImport = () => router.push('/sales-import')
const goToProducts = () => router.push('/products')
const goToSales = () => router.push('/sales-view')
const goToReport = () => router.push('/report')
</script>
