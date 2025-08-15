<template>
  <!-- 以 CSS 變數覆寫欄寬，只影響此頁 -->
  <section
    class="plv-page"
    :style="colVars"
  >
    <!-- 工具列 -->
    <header class="flex items-center gap-4 mb-3">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
        全選
      </label>

      <button :disabled="selectedIds.length===0 || busy" @click="vectorizeSelected">
        圖文轉向量（已勾選）
      </button>

      <!-- 右側：每頁筆數放最右邊 -->
      <div class="ml-auto flex items-center gap-2">
        <span>每頁筆數：</span>
        <select v-model.number="pageSize" @change="changePageSize">
          <option v-for="n in pageSizes" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </header>

    <!-- 表格：固定欄寬 + 超出出現水平捲軸 -->
     <div class="plv-hscroll">
    <table class="plv-table">
        <colgroup>
          <col class="col-turn"  />
          <col class="col-code"  />
          <col class="col-name"  />
          <col class="col-price" />
          <col class="col-color" />
          <col class="col-big"   />
          <col class="col-mid"   />
          <col class="col-desc"  />
          <col class="col-date"  />
          <col class="col-start" />
          <col class="col-end"   />
          <col class="col-thumb" />
          <col class="col-vec"   />
          <col class="col-act"   />
        </colgroup>

        <thead>
          <tr>
            <th><div class="cell">轉向量</div></th>
            <th><div class="cell">商品代號</div></th>
            <th><div class="cell">商品名稱</div></th>
            <th><div class="cell">價格</div></th>
            <th><div class="cell">顏色</div></th>
            <th><div class="cell">大分類</div></th>
            <th><div class="cell">中分類</div></th>
            <th><div class="cell">描述</div></th>
            <th><div class="cell">進貨日期</div></th>
            <th><div class="cell">期初</div></th>
            <th><div class="cell">期末</div></th>
            <th><div class="cell">縮圖</div></th>
            <th><div class="cell">已轉?</div></th>
            <th><div class="cell">操作</div></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in items" :key="p.id">
            <!-- 1) 轉向量：固定 90px -->
            <td>
              <div class="cell">
                <input type="checkbox" :value="p.id" v-model="selectedIds" :disabled="busy" />
              </div>
            </td>

            <td><div class="cell plv-ellipsis-1" :title="p.code">{{ p.code }}</div></td>

            <!-- 2) 商品名稱：固定 120px、單行省略 -->
            <td><div class="cell plv-ellipsis-1" :title="p.name">{{ p.name }}</div></td>

            <!-- 3) 價格：固定 100px -->
            <td><div class="cell">{{ formatPrice(p.price) }}</div></td>

            <td><div class="cell plv-ellipsis-1" :title="p.color_name">{{ p.color_name }}</div></td>

            <!-- 4) 大分類：固定 120px -->
            <td><div class="cell plv-ellipsis-1" :title="p.big_category_name">{{ p.big_category_name }}</div></td>

            <!-- 5) 中分類：固定 120px、單行省略、hover 顯示完整 -->
            <td>
              <div class="cell plv-ellipsis-1" :title="p.mid_category_name || ''">
                {{ p.mid_category_name || '' }}
              </div>
            </td>

            <!-- 6) 描述：固定 220px、單行省略、hover 顯示完整 -->
            <td>
              <div class="cell plv-ellipsis-1" :title="p.description || ''">
                {{ p.description || '' }}
              </div>
            </td>

            <!-- 7) 進貨日期：固定 120px -->
            <td><div class="cell">{{ formatDate(p.initial_stock_date) }}</div></td>

            <!-- 8) 期初：固定 100px -->
            <td><div class="cell">{{ p.initial_stock_qty }}</div></td>

            <!-- 9) 期末：固定 100px -->
            <td><div class="cell">{{ p.current_stock_qty }}</div></td>

            <!-- 10) 縮圖：固定 120px -->
            <td>
              <div class="cell">
                <img
                  v-if="p.image_path"
                  :src="p.image_path"
                  alt=""
                  class="thumb"
                  @click="showImage(p.image_path)"
                />
              </div>
            </td>

            <!-- 11) 已轉?：固定 100px -->
            <td>
              <div class="cell">
                <span :class="p.vectorized ? 'ok':'pending'">
                  {{ p.vectorized ? '是' : '否' }}
                </span>
              </div>
            </td>

            <!-- 12) 操作：固定 260px -->
            <td>
              <div class="cell actions">
                <button :disabled="busy" @click="openEdit(p)">編輯</button>
                <button :disabled="busy" @click="confirmDelete(p)">刪除</button>
                <button :disabled="busy" @click="vectorizeOne(p)">圖文轉向量</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <footer class="mt-4 flex justify-end items-center gap-3">
      <button :disabled="page<=1 || busy" @click="go(page-1)">上一頁</button>
      <span>第 {{ page }} / {{ totalPages || 1 }} 頁（共 {{ total }} 筆）</span>
      <button :disabled="page>=totalPages || busy" @click="go(page+1)">下一頁</button>
    </footer>

    <!-- 編輯彈窗 -->
    <dialog ref="editDlg">
      <form method="dialog" class="dialog-card" @submit.prevent="saveEdit">
        <h3>編輯商品</h3>
        <div class="row"><label>商品代號</label><input type="text" :value="editing?.code" disabled></div>
        <div class="row"><label>價格</label><input type="number" v-model.number="editingDraft.price" min="0" step="1" required></div>
        <div class="row"><label>商品名稱</label><input type="text" v-model.trim="editingDraft.name" maxlength="100" required></div>
        <div class="row">
          <label>顏色</label>
          <select v-model="editingDraft.colorCode" required>
            <option v-for="c in colors" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
        <div class="row"><label>大分類</label><input type="text" :value="editing?.big_category_name || ''" disabled></div>
        <div class="row"><label>中分類</label><input type="text" :value="editing?.mid_category_name || ''" disabled></div>
        <div class="row"><label>描述</label><textarea v-model.trim="editingDraft.description" maxlength="2000" rows="4"></textarea></div>
        <div class="row"><label>進貨日期</label><input type="text" :value="formatDate(editing?.initial_stock_date)" disabled></div>
        <div class="row">
          <label>期初/期末</label>
          <div class="inline">
            <input type="text" :value="editing?.initial_stock_qty" disabled>
            <input type="text" :value="editing?.current_stock_qty" disabled>
          </div>
        </div>
        <menu>
          <button value="cancel" :disabled="busy">取消</button>
          <button class="primary" @click.prevent="saveEdit" :disabled="busy">儲存</button>
        </menu>
      </form>
    </dialog>

    <!-- 刪除確認 -->
    <dialog ref="delDlg">
      <form method="dialog" class="dialog-card" @submit.prevent="doDelete">
        <h3>確認刪除</h3>
        <p>確定要刪除「{{ deleting?.code }} — {{ deleting?.name }}」嗎？</p>
        <menu>
          <button value="cancel" :disabled="busy">取消</button>
          <button class="danger" @click.prevent="doDelete" :disabled="busy">確認刪除</button>
        </menu>
      </form>
    </dialog>

    <!-- 圖片預覽 -->
    <dialog ref="imgDlg" class="img-dlg" @click="closeImage">
      <img :src="previewUrl" v-if="previewUrl">
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const BASE = import.meta.env.VITE_API_BASE || '/api'
const API = BASE + '/products'

// state
const items = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSizes = [20, 40, 60, 80, 100]
const pageSize = ref(20)
const busy = ref(false)

// selection
const selectAll = ref(false)
const selectedIds = ref<number[]>([])
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// dialogs & preview
const editDlg = ref<HTMLDialogElement | null>(null)
const delDlg = ref<HTMLDialogElement | null>(null)
const imgDlg = ref<HTMLDialogElement | null>(null)
const previewUrl = ref<string>('')

// editing
const editing = ref<any | null>(null)
const editingDraft = ref<any>({})
const colors = ref<{code:string; name:string}[]>([])

// 覆寫本頁欄寬（與 components.css 的 var 名稱對應）
const colVars = computed(() => ({
  // 1) 轉向量 90
  '--plv-col-turn': '90px',

  // 2) 商品名稱 120
  '--plv-col-name': '120px',

  // 3) 價格 100
  '--plv-col-price': '100px',

  // 顏色/商品代號 可沿用全域既有設定；不特別覆寫

  // 4) 大分類 120
  '--plv-col-big': '120px',

  // 5) 中分類 120（單行省略）
  '--plv-col-mid': '120px',

  // 6) 描述 220（單行省略）
  '--plv-col-desc': '220px',

  // 7) 進貨日期 120
  '--plv-col-date': '120px',

  // 8) 期初 100、9) 期末 100、11) 已轉? 100
  '--plv-col-num': '100px',

  // 10) 縮圖 120
  '--plv-col-thumb': '120px',

  // 12) 操作 260
  '--plv-col-act': '260px'
}))

onMounted(async () => {
  await fetchColors()
  await fetchList()
})

async function fetchList() {
  busy.value = true
  try {
    const r = await fetch(`${API}?page=${page.value}&pageSize=${pageSize.value}`)
    const data = await r.json()
    items.value = data.items || []
    total.value = data.total || 0
    selectAll.value = false
    selectedIds.value = []
  } finally {
    busy.value = false
  }
}

async function fetchColors() {
  try {
    const r = await fetch(`${API}/colors`)
    colors.value = await r.json()
  } catch {
    colors.value = []
  }
}

function changePageSize() { page.value = 1; fetchList() }
function go(p:number){ page.value = Math.min(Math.max(1,p), totalPages.value || 1); fetchList() }

function toggleSelectAll() {
  selectedIds.value = selectAll.value ? items.value.map(x => x.id) : []
}

function formatPrice(n:number){ return (n ?? 0).toLocaleString('zh-TW', { minimumFractionDigits: 0 }) }
function formatDate(d:string|null|undefined){
  if(!d) return ''
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('zh-TW')
}

function showImage(url?:string){ if(!url) return; previewUrl.value = url; imgDlg.value?.showModal() }
function closeImage(){ imgDlg.value?.close(); previewUrl.value = '' }

function openEdit(p:any){
  editing.value = { ...p }
  editingDraft.value = {
    name: p.name,
    price: p.price,
    colorCode: p.color_code,
    description: p.description || ''
  }
  editDlg.value?.showModal()
}
async function saveEdit(){
  if(!editing.value) return
  busy.value = true
  try{
    const r = await fetch(`${API}/${editing.value.id}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(editingDraft.value)
    })
    const data = await r.json().catch(()=> ({}))
    if(!r.ok){ alert('儲存失敗：' + (data.message || r.statusText)); return }
    editDlg.value?.close()
    await fetchList()
  } finally { busy.value = false }
}

let deleting:any|null = null
function confirmDelete(p:any){ deleting = p; delDlg.value?.showModal() }
async function doDelete(){
  if(!deleting) return
  busy.value = true
  try{
    const r = await fetch(`${API}/${deleting.id}`, { method:'DELETE' })
    const data = await r.json().catch(()=> ({}))
    if(!r.ok){ alert('刪除失敗：' + (data.message || r.statusText)); return }
    delDlg.value?.close()
    await fetchList()
  } finally { busy.value = false }
}

async function vectorizeOne(p:any){
  busy.value = true
  try{
    const r = await fetch(`${API}/${p.id}/vectorize`, { method:'POST' })
    const data = await r.json().catch(()=> ({}))
    if(!r.ok){ alert('向量化失敗：' + (data.message || r.statusText)); return }
    await fetchList()
  } finally { busy.value = false }
}
async function vectorizeSelected(){
  if(selectedIds.value.length===0) return
  busy.value = true
  try{
    const r = await fetch(`${API}/vectorize`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ids: selectedIds.value })
    })
    const data = await r.json().catch(()=> ({}))
    if(!r.ok){ alert('批次向量化失敗：' + (data.message || r.statusText)); return }
    await fetchList()
  } finally { busy.value = false }
}
</script>

<style scoped>
/* 僅本頁微調：單行高度、縮圖大小、操作區排列 */
.plv-table th,
.plv-table td{
  height: 44px;                  /* 15) 單行固定高度 */
  vertical-align: middle;
}

.thumb{
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* 操作按鈕排列（不改按鈕外觀） */
.actions{
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

/* 本頁額外欄：縮圖寬度 120px（透過本頁變數覆蓋） */
.plv-table col.col-thumb { width: var(--plv-col-thumb) !important; }

/* 保險：即使有其它樣式撐寬，中分類/描述也會鎖住寬度 */
.plv-table th:nth-child(7),
.plv-table td:nth-child(7){
  width: var(--plv-col-mid) !important;
  min-width: var(--plv-col-mid) !important;
  max-width: var(--plv-col-mid) !important;
}
.plv-table th:nth-child(8),
.plv-table td:nth-child(8){
  width: var(--plv-col-desc) !important;
  min-width: var(--plv-col-desc) !important;
  max-width: var(--plv-col-desc) !important;
}
</style>
