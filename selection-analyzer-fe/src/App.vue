<template>
  <!-- 建議在 index.html 的 <html> 設 data-theme="plv"，這裡仍會正常工作 -->
  <div class="min-h-screen text-[var(--plv-ink)] bg-[var(--plv-surface)]">
    <!-- Site header / menu -->
    <header class="sticky top-0 z-40 bg-[var(--plv-surface)]/95 backdrop-blur border-b border-[var(--plv-line)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="h-16 flex items-center justify-between gap-4">
          <h1 class="text-lg sm:text-xl font-semibold tracking-tight">
            選品潛力分析器
          </h1>

          <nav class="flex items-center gap-2 flex-wrap">
            <RouterLink
              to="/upload"
              class="plv-btn--outline hover:shadow-sm"
            >匯入商品資料</RouterLink>

            <RouterLink
              to="/upload-sales"
              class="plv-btn--outline hover:shadow-sm"
            >匯入銷售資料</RouterLink>

            <RouterLink
              to="/products"
              class="plv-btn--outline hover:shadow-sm"
            >商品資料維護</RouterLink>

            <RouterLink
              to="/sales-view"
              class="plv-btn--outline hover:shadow-sm"
            >查詢銷售資料</RouterLink>

            <RouterLink
              to="/report"
              class="plv-btn--outline hover:shadow-sm"
            >查看潛力報告</RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
