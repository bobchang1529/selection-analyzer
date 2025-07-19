// === 路由設定：src/router/index.js ===
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UploadView from '../views/UploadView.vue'
import ReportView from '../views/ReportView.vue'
import ProductListView from '../views/ProductListView.vue'
import ProductEditView from '../views/ProductEditView.vue'
import ProductDeleteView from '../views/ProductDeleteView.vue'
import SalesView from '../views/SalesView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/upload', name: 'upload', component: UploadView },
  { path: '/report', name: 'report', component: ReportView },
  { path: '/products', name: 'products', component: ProductListView },
  { path: '/products/edit/:id', name: 'edit-product', component: ProductEditView },
  { path: '/products/delete/:id', name: 'delete-product', component: ProductDeleteView },
  { path: '/sales-view', name: 'sales-view', component: SalesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router