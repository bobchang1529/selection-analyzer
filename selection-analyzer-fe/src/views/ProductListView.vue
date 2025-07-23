
<template>
  <div class="px-4">
    <!-- Title + Button 同列、樣式一致 -->
    <div class="flex justify-between items-center mt-4 mb-2">
      <h1 class="text-base font-bold text-left">商品清單</h1>
      <button
        class="btn btn-sm btn-outline btn-primary"
        @click="goToUpload"
      >
        匯入商品資料與圖片
      </button>
    </div>

    <!-- 商品清單表格 -->
    <div class="overflow-x-auto bg-base-100">
      <table class="table table-zebra text-sm">
        <thead>
          <tr>
            <th>商品代號</th>
            <th>商品名稱</th>
            <th>品牌</th>
            <th>分類</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.category }}</td>
            <td>
              <!-- 操作按鈕 -->
              <button class="btn btn-xs btn-primary">編輯</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/products')
  products.value = res.data
})
</script>
