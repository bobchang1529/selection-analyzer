// === 商品查詢頁：src/views/ProductListView.vue ===
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">商品查詢</h2>
    <table class="table-auto w-full border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2">圖像</th>
          <th class="border px-4 py-2">商品編號</th>
          <th class="border px-4 py-2">商品名稱</th>
          <th class="border px-4 py-2">分類</th>
          <th class="border px-4 py-2">價格</th>
          <th class="border px-4 py-2">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td class="border px-4 py-2">
            <img :src="`http://localhost:3000/images/products/${product.product_code}.avif`"
                 @error="useFallback($event)"
                 alt="圖" class="w-16 h-16 object-cover rounded" />
          </td>
          <td class="border px-4 py-2">{{ product.product_code }}</td>
          <td class="border px-4 py-2">{{ product.name }}</td>
          <td class="border px-4 py-2">{{ product.category_md }}</td>
          <td class="border px-4 py-2">{{ product.price }}</td>
          <td class="border px-4 py-2 space-x-2">
            <button class="bg-yellow-500 text-white px-2 py-1 rounded" @click="goToEdit(product.id)">編輯</button>
            <button class="bg-red-600 text-white px-2 py-1 rounded" @click="goToDelete(product.id)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/products')
  products.value = res.data
})

function goToEdit(id) {
  router.push(`/products/edit/${id}`)
}

function goToDelete(id) {
  router.push(`/products/delete/${id}`)
}

function useFallback(e) {
  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
}
</script>

<style scoped>
th, td {
  text-align: left;
}
</style>
