// === 銷售資料頁：src/views/SalesView.vue ===
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">商品歷史銷售資料</h2>
    <table class="table-auto w-full border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2">商品代碼</th>
          <th class="border px-4 py-2">週次</th>
          <th class="border px-4 py-2">銷售數量</th>
          <th class="border px-4 py-2">銷售金額</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in sales" :key="sale.id">
          <td class="border px-4 py-2">{{ sale.product_code }}</td>
          <td class="border px-4 py-2">{{ sale.week }}</td>
          <td class="border px-4 py-2">{{ sale.units_sold }}</td>
          <td class="border px-4 py-2">{{ sale.sales_amount }}</td>
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
