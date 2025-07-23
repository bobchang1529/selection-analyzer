
<template>
  <div class="mt-0 pt-0 ml-4 mt-4 ml-4 p-8 max-w-4xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">銷售清單</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 text-sm text-left text-gray-600">
          <th class="p-2">銷售代號</th>
          <th class="p-2">銷售名稱</th>
          <th class="p-2">品牌</th>
          <th class="p-2">分類</th>
          <th class="p-2">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" class="border-b text-sm">
          <td class="p-2">{{ product.code }}</td>
          <td class="p-2">{{ product.name }}</td>
          <td class="p-2">{{ product.brand }}</td>
          <td class="p-2">{{ product.category }}</td>
          <td class="p-2">
            <router-link :to="'/sales/edit/' + product.id" class="text-blue-600 hover:underline mr-2">編輯</router-link>
            <router-link :to="'/sales/delete/' + product.id" class="text-red-600 hover:underline">刪除</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/sales')
  products.value = res.data
})
</script>
