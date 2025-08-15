/// <reference types="vite/client" />

// 讓 TS 能理解 .vue 檔
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
