// === 報表頁元件：src/views/ReportView.vue ===
<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">選品潛力報告</h2>
    <ul>
      <li v-for="item in report" :key="item.id" class="mb-4 flex items-center space-x-4">
        <img :src="`http://localhost:3000/images/products/${item.product_code}.avif`"
             @error="useFallback($event)"
             alt="商品圖" class="w-20 h-20 object-cover rounded" />
        <div>
          <p class="font-bold">{{ item.name }}</p>
          <p>潛力指數：{{ item.score }} 分</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const report = ref([
  { id: 1, name: '高腰直筒褲', product_code: 'D1001', score: 88 },
  { id: 2, name: '蕾絲花邊襯衫', product_code: 'D1002', score: 76 },
  { id: 3, name: '牛仔吊帶裙', product_code: 'D1003', score: 91 }
])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/products/report')
    if (res.data.items) report.value = res.data.items
  } catch (e) {
    console.warn('無法取得報告資料，使用預設測試資料')
  }
})

function useFallback(e) {
  e.target.src = 'https://via.placeholder.com/120x120?text=No+Image'
}
</script>