<template>
  <div class="min-h-screen bg-white">
    <header class="flex justify-between items-center px-6 py-4 border-b">
      <h1 class="text-xl font-bold text-gray-900">選品潛力分析器</h1>
      <nav class="space-x-2">
        <!-- ⑤ 導覽按鈕：淺灰背景 + 黑字 + 黑色外框 -->
        <button @click="go('/upload')" class="menu-btn">匯入商品資料</button>
        <button @click="go('/upload-sales')" class="menu-btn">匯入銷售資料</button>
        <button @click="go('/products')" class="menu-btn">商品資料維護</button>
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
:root, :host {
  --plv-font: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei",
              Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --plv-text: #0b0c0e;
  --plv-accent: #111;
}

/* 全站用更紮實黑體與深色字 */
* { font-family: var(--plv-font); color: var(--plv-text); }

/* ⑤ 導覽按鈕：淺灰背景、黑字、黑色外框、圓角 */
.menu-btn{
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1.5px solid var(--plv-accent);
  background: #f7f8fa;
  color: var(--plv-text);
  font-weight: 600;
  transition: box-shadow .15s ease, background .15s ease, transform .02s ease;
}
.menu-btn:hover{ background: #fff; box-shadow: 0 3px 10px rgba(0,0,0,.06); }
.menu-btn:active{ transform: translateY(1px); }
.menu-btn:disabled{ opacity:.55; cursor:not-allowed; }
</style>
