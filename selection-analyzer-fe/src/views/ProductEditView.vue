// === 商品編輯頁：src/views/ProductEditView.vue ===
<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">編輯商品</h2>
    <img :src="`http://localhost:3000/images/products/${product.product_code}.avif`"
         @error="useFallback"
         alt="商品圖"
         class="w-32 h-32 object-cover rounded mb-4 border"
         ref="imageRef" />
    <form @submit.prevent="updateProduct">
      <div class="mb-4">
        <label class="block text-sm font-medium">商品名稱</label>
        <input v-model="product.name" class="w-full border rounded px-3 py-2" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">中分類</label>
        <input v-model="product.category_md" class="w-full border rounded px-3 py-2" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium">價格</label>
        <input v-model.number="product.price" type="number" class="w-full border rounded px-3 py-2" />
      </div>
      <div class="flex justify-end space-x-4">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">儲存變更</button>
        <button type="button" @click="goBack" class="bg-gray-400 text-white px-4 py-2 rounded">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const product = ref({})
const imageRef = ref(null)

onMounted(async () => {
  const id = route.params.id
  const res = await axios.get(`http://localhost:3000/api/products/${id}`)
  product.value = res.data
})

async function updateProduct() {
  const id = route.params.id
  await axios.put(`http://localhost:3000/api/products/${id}`, product.value)
  alert('商品已更新')
  router.push('/products')
}

function goBack() {
  router.push('/products')
}

function useFallback(e) {
  e.target.src = 'https://via.placeholder.com/120x120?text=No+Image'
}
</script>
