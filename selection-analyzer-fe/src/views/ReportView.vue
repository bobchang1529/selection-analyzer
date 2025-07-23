
<template>
  <div class="mt-0 pt-0 ml-4 mt-4 ml-4 p-8 max-w-4xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">選品潛力報告</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 text-sm text-left text-gray-600">
          <th class="p-2">商品代號</th>
          <th class="p-2">商品名稱</th>
          <th class="p-2">潛力分數</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in report" :key="item.id" class="border-b text-sm">
          <td class="p-2">{{ item.code }}</td>
          <td class="p-2">{{ item.name }}</td>
          <td class="p-2">{{ item.score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const report = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/products/report')
    report.value = res.data.items
  } catch {
    report.value = [
      { id: 1, code: 'P001', name: '蕾絲襯衫', score: 87 },
      { id: 2, code: 'P002', name: '高腰長褲', score: 74 }
    ]
  }
})
</script>
