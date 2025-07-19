// === 商品刪除頁：src/views/ProductDeleteView.vue ===
<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">確認刪除</h2>
    <p class="mb-4 text-gray-700">您確定要刪除此商品？刪除後將無法復原。</p>
    <div class="mb-4 p-4 border rounded bg-gray-50">
      <p><strong>商品名稱：</strong> {{ product.name }}</p>
      <p><strong>分類：</strong> {{ product.category_md }}</p>
      <p><strong>價格：</strong> {{ product.price }}</p>
    </div>
    <div class="flex justify-end space-x-4">
      <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded">確定刪除</button>
      <button @click="goBack" class="bg-gray-400 text-white px-4 py-2 rounded">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const product = ref({})

onMounted(async () => {
  const res = await axios.get(`http://localhost:3000/api/products/${route.params.id}`)
  product.value = res.data
})

async function confirmDelete() {
  await axios.delete(`http://localhost:3000/api/products/${route.params.id}`)
  alert('已刪除商品')
  router.push('/products')
}

function goBack() {
  router.push('/products')
}
</script>
