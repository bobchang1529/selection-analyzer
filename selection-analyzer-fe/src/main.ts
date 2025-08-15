import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 👉 匯入全域樣式（只匯入這一支就好，其他都由它引入）
import './styles/tailwind.css'
// import './index.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
