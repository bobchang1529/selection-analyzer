import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UploadView from '../views/UploadView.vue'
import SalesImportView from '../views/SalesImportView.vue'
import ReportView from '../views/ReportView.vue'
import ProductListView from '../views/ProductListView.vue'
import SalesView from '../views/SalesView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/upload', name: 'upload', component: UploadView },
  { path: '/upload-sales', name: 'upload-sales', component: SalesImportView },
  { path: '/report', name: 'report', component: ReportView },
  { path: '/products', name: 'products', component: ProductListView },
  { path: '/sales-view', name: 'sales-view', component: SalesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
