/ ✅ 前端頁面：src/views/SalesView.vue
<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">銷售資料查詢</h2>
    <table class="table-auto w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">商品編號</th>
          <th class="border px-2 py-1">週次</th>
          <th class="border px-2 py-1">銷售數量</th>
          <th class="border px-2 py-1">銷售金額</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in sales" :key="s.id">
          <td class="border px-2 py-1">{{ s.product_code }}</td>
          <td class="border px-2 py-1">{{ s.week }}</td>
          <td class="border px-2 py-1">{{ s.units_sold }}</td>
          <td class="border px-2 py-1">{{ s.sales_amount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const sales = ref([])

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/sales')
  sales.value = res.data
})
</script>