<template>
  <div class="app">
    <header class="nav">
      <router-link to="/" class="brand">選品潛力分析器</router-link>
      <nav class="menu">
        <router-link to="/products" active-class="active">商品資料維護</router-link>
      </nav>
    </header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }
.nav { display:flex; align-items:center; gap:16px; padding:12px 20px; border-bottom:1px solid #eee; }
.brand { font-weight:700; }
.menu a { margin-right: 12px; }
.active { font-weight: 700; text-decoration: underline; }
.content { flex:1; padding: 16px; }
</style>
