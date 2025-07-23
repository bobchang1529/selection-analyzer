<template>
  <div class="min-h-screen bg-white">
    <header class="flex justify-between items-center px-6 py-4 border-b">
      <h1 class="text-xl font-bold text-gray-800">選品潛力分析器</h1>
      <nav class="space-x-2">
        <button @click="go('/upload')" class="menu-btn">匯入商品資料</button>
        <button @click="go('/upload-sales')" class="menu-btn">匯入銷售資料</button>
        <button @click="go('/products')" class="menu-btn">查詢商品資料</button>
        <button @click="go('/sales-view')" class="menu-btn">查詢銷售資料</button>
        <button @click="go('/report')" class="menu-btn">查看潛力報告</button>
      </nav>
    </header>
    <main class="p-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (path) => router.push(path)
</script>

<style scoped>
.menu-btn {
  @apply bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-200 transition;
}
</style>

