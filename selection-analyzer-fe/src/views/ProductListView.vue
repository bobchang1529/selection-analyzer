<template>
  <section class="plv-page">
    <!-- 工具列 -->
    <header class="list-head">
      <div class="left">
        <label class="chk">
          <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          全選
        </label>

        <button class="btn" :disabled="selectedIds.length===0 || busy" @click="vectorizeSelected">
          圖文轉向量（已勾選）
        </button>
      </div>

      <div class="right">
        <label class="nowrap">
          每頁筆數：
          <select v-model.number="pageSize" @change="changePageSize">
            <option v-for="n in pageSizes" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
    </header>

    <!-- 置頂水平捲軸（固定在表格上方） -->
    <div class="plv-hscroll" ref="topScroller" @scroll.passive="onTopScroll">
      <div class="plv-hscroll-inner" ref="topInner"></div>
    </div>

    <!-- 表格容器（可水平捲動，與上方捲軸雙向同步） -->
    <div class="plv-table-card">
      <div class="plv-table-wrap" ref="tableWrap">
        <table class="plv-table">
          <thead>
            <tr>
              <th>轉向量</th>
              <th>商品代號</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th>顏色</th>
              <th>大分類</th>
              <th>中分類</th>
              <th>描述</th>
              <th>進貨日期</th>
              <th>期初</th>
              <th>期末</th>
              <th>縮圖</th>
              <th>已轉?</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in items" :key="p.id">
              <td class="c-center col-select">
                <input type="checkbox" :value="p.id" v-model="selectedIds" :disabled="busy" />
              </td>
              <td class="col-code">{{ p.code }}</td>
              <td class="ellipsis col-name" :title="p.name">{{ p.name }}</td>
              <td class="num col-price">{{ formatPrice(p.price) }}</td>
              <td class="col-color">{{ p.color_name }}</td>
              <td class="col-cat">{{ p.big_category_name || '' }}</td>
              <td class="wrap col-midcat">{{ p.mid_category_name || '' }}</td>
              <td class="wrap col-desc" :title="p.description">{{ p.description }}</td>
              <td class="col-date">{{ formatDate(p.initial_stock_date) }}</td>
              <td class="num col-qty">{{ p.initial_stock_qty }}</td>
              <td class="num col-qty">{{ p.current_stock_qty }}</td>
              <td class="c-center col-thumb">
                <img v-if="p.image_path" :src="p.image_path" class="thumb" @click="showImage(p.image_path)" />
              </td>
              <td class="c-center col-flag">
                <span :class="p.vectorized ? 'pill pill-ok':'pill pill-pending'">{{ p.vectorized ? '是' : '否' }}</span>
              </td>
              <td class="actions col-actions">
                <button class="btn ghost" :disabled="busy" @click="openEdit(p)">編輯</button>
                <button class="btn danger ghost" :disabled="busy" @click="confirmDelete(p)">刪除</button>
                <button class="btn" :disabled="busy" @click="vectorizeOne(p)">轉向量</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分頁 -->
    <footer class="pager">
      <button class="btn ghost" :disabled="page<=1 || busy" @click="go(page-1)">上一頁</button>
      <span>第 {{ page }} / {{ totalPages || 1 }} 頁（共 {{ total }} 筆）</span>
      <button class="btn ghost" :disabled="page>=totalPages || busy" @click="go(page+1)">下一頁</button>
    </footer>

    <!-- 編輯彈窗 -->
    <dialog ref="editDlg">
      <form method="dialog" class="dialog-card" @submit.prevent="saveEdit">
        <h3>編輯商品</h3>
        <div class="row"><label>商品代號</label><input type="text" :value="editing?.code" disabled /></div>
        <div class="row"><label>價格</label><input type="number" v-model.number="editingDraft.price" min="0" step="1" required /></div>
        <div class="row"><label>商品名稱</label><input type="text" v-model.trim="editingDraft.name" maxlength="100" required /></div>
        <div class="row">
          <label>顏色</label>
          <select v-model="editingDraft.colorCode" required>
            <option v-for="c in colors" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
        </div>
        <div class="row"><label>大分類</label><input type="text" :value="editing?.big_category_name || ''" disabled /></div>
        <div class="row"><label>中分類</label><input type="text" :value="editing?.mid_category_name || ''" disabled /></div>
        <div class="row"><label>描述</label><textarea v-model.trim="editingDraft.description" maxlength="2000" rows="4" /></div>
        <div class="row"><label>進貨日期</label><input type="text" :value="formatDate(editing?.initial_stock_date)" disabled /></div>
        <div class="row">
          <label>期初/期末</label>
          <div class="inline">
            <input type="text" :value="editing?.initial_stock_qty" disabled />
            <input type="text" :value="editing?.current_stock_qty" disabled />
          </div>
        </div>
        <menu>
          <button class="btn ghost" value="cancel" :disabled="busy">取消</button>
          <button class="btn" @click.prevent="saveEdit" :disabled="busy">儲存</button>
        </menu>
      </form>
    </dialog>

    <!-- 刪除確認 -->
    <dialog ref="delDlg">
      <form method="dialog" class="dialog-card" @submit.prevent="doDelete">
        <h3>確認刪除</h3>
        <p>確定要刪除「{{ deleting?.code }} — {{ deleting?.name }}」嗎？</p>
        <menu>
          <button class="btn ghost" value="cancel" :disabled="busy">取消</button>
          <button class="btn danger" @click.prevent="doDelete" :disabled="busy">確認刪除</button>
        </menu>
      </form>
    </dialog>

    <!-- 圖片預覽 -->
    <dialog ref="imgDlg" class="img-dlg" @click="closeImage">
      <img :src="previewUrl" v-if="previewUrl" />
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

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
const colors = ref<{ code: string; name: string }[]>([])

/** ===== Sticky Top Horizontal Scrollbar Sync ===== */
const tableWrap = ref<HTMLDivElement | null>(null)
const topScroller = ref<HTMLDivElement | null>(null)
const topInner = ref<HTMLDivElement | null>(null)

// 上方捲動 → 帶動表格
const onTopScroll = (e: Event) => {
  if (tableWrap.value) tableWrap.value.scrollLeft = (e.target as HTMLElement).scrollLeft
}

// 表格橫向捲動 → 帶動上方捲軸
const onBodyScroll = () => {
  if (!topScroller.value || !tableWrap.value) return
  const x = tableWrap.value.scrollLeft
  if (topScroller.value.scrollLeft !== x) {
    topScroller.value.scrollLeft = x
  }
}

// 同步上方假捲軸寬度與表格內容寬度
const syncWidths = () => {
  if (tableWrap.value && topInner.value) {
    topInner.value.style.width = tableWrap.value.scrollWidth + 'px'
  }
}

/** ===== Data ===== */
onMounted(async () => {
  await fetchColors()
  await fetchList()

  await nextTick()
  syncWidths()
  window.addEventListener('resize', syncWidths)
  tableWrap.value?.addEventListener('scroll', onBodyScroll, { passive: true } as AddEventListenerOptions)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncWidths)
  tableWrap.value?.removeEventListener('scroll', onBodyScroll as EventListener)
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
    nextTick(syncWidths)
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
function go(p: number) { page.value = Math.min(Math.max(1, p), totalPages.value || 1); fetchList() }

function toggleSelectAll() {
  selectedIds.value = selectAll.value ? items.value.map(x => x.id) : []
}

function formatPrice(n: number) { return (n ?? 0).toLocaleString('zh-TW', { minimumFractionDigits: 0 }) }
function formatDate(d: string | null | undefined) {
  if (!d) return ''
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('zh-TW')
}

function showImage(url?: string) { if (!url) return; previewUrl.value = url; imgDlg.value?.showModal() }
function closeImage() { imgDlg.value?.close(); previewUrl.value = '' }

function openEdit(p: any) {
  editing.value = { ...p }
  editingDraft.value = {
    name: p.name,
    price: p.price,
    colorCode: p.color_code,
    description: p.description || ''
  }
  editDlg.value?.showModal()
}
async function saveEdit() {
  if (!editing.value) return
  busy.value = true
  try {
    const r = await fetch(`${API}/${editing.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingDraft.value)
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) { alert('儲存失敗：' + (data.message || r.statusText)); return }
    editDlg.value?.close()
    await fetchList()
  } finally { busy.value = false }
}

let deleting: any | null = null
function confirmDelete(p: any) { deleting = p; delDlg.value?.showModal() }
async function doDelete() {
  if (!deleting) return
  busy.value = true
  try {
    const r = await fetch(`${API}/${deleting.id}`, { method: 'DELETE' })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) { alert('刪除失敗：' + (data.message || r.statusText)); return }
    delDlg.value?.close()
    await fetchList()
  } finally { busy.value = false }
}

async function vectorizeOne(p: any) {
  busy.value = true
  try {
    const r = await fetch(`${API}/${p.id}/vectorize`, { method: 'POST' })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) { alert('向量化失敗：' + (data.message || r.statusText)); return }
    await fetchList()
  } finally { busy.value = false }
}
async function vectorizeSelected() {
  if (selectedIds.value.length === 0) return
  busy.value = true
  try {
    const r = await fetch(`${API}/vectorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds.value })
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) { alert('批次向量化失敗：' + (data.message || r.statusText)); return }
    await fetchList()
  } finally { busy.value = false }
}
</script>

<style scoped>
/* ===== 色票 / 變數 ===== */
:root, :host {
  --bg-page: #f3f4f6;         /* 整體較深背景 */
  --card: #ffffff;
  --line: #e5e7eb;
  --line2: #d1d5db;
  --text: #111827;
  --text-2: #374151;
  --muted: #6b7280;
  --blue: #2563eb;
  --blue-soft: #60a5fa;
  --ok: #059669;
  --warn: #f59e0b;
  --danger: #dc2626;

  /* 欄寬（可依需求調整） */
  --w-select: 64px;
  --w-code: 120px;
  --w-name: 240px;
  --w-price: 100px;
  --w-color: 84px;
  --w-cat: 100px;
  --w-midcat: 160px; /* 中分類縮小且可折行 */
  --w-desc: 420px;   /* 描述縮小且可折行 */
  --w-date: 120px;
  --w-qty: 90px;
  --w-thumb: 72px;
  --w-flag: 80px;
  --w-actions: 240px;
}

/* ===== Page ===== */
.plv-page{
  background: var(--bg-page);
  color: var(--text);
  padding: 12px 0 24px;
  font-size: 14px;
}

/* ===== 工具列 ===== */
.list-head{
  display:flex; align-items:center; justify-content:space-between;
  gap: 12px; padding: 8px 2px 10px;
}
.list-head .left{ display:flex; align-items:center; gap: 10px; }
.list-head .right select{
  height: 32px; padding: 0 8px; border: 1px solid var(--line2);
  border-radius: 8px; background: #fff;
}
.nowrap{ white-space: nowrap; color: var(--text-2); }

/* button */
.btn{
  appearance: none; border: 1px solid var(--text); color:#fff; background: var(--text);
  padding: 8px 14px; border-radius: 10px; font-weight: 600; letter-spacing: .2px;
  transition: filter .15s ease, transform .02s ease;
}
.btn:hover{ filter: brightness(1.08); }
.btn:active{ transform: translateY(1px); }
.btn.ghost{
  background:#fff; color: var(--text); border-color: var(--line2);
}
.btn.danger{ background: var(--danger); border-color: var(--danger); }
.btn.danger.ghost{ color: var(--danger); background:#fff; border-color: var(--danger); }

/* checkbox（高對比） */
.plv-page input[type="checkbox"]{
  -webkit-appearance: none; appearance: none;
  position: relative; width: 20px; height: 20px; cursor: pointer;
  border-radius: 6px; border: 2px solid #111; background:#fff; outline: none;
  transition: box-shadow .15s ease, background .15s ease, border-color .15s ease;
}
.plv-page input[type="checkbox"]:hover{ box-shadow: 0 0 0 3px rgba(17,17,17,.08); }
.plv-page input[type="checkbox"]:focus-visible{ box-shadow: 0 0 0 3px rgba(17,17,17,.18); }
.plv-page input[type="checkbox"]:checked{ background:#111; border-color:#111; }
.plv-page input[type="checkbox"]:checked::after{
  content:""; position:absolute; left:5px; top:2px; width:7px; height:12px;
  border:3px solid #fff; border-top:0; border-left:0; transform: rotate(45deg);
}
.plv-page input[type="checkbox"]:disabled{ opacity:.5; cursor:not-allowed; }

/* ===== sticky 上方水平捲軸 ===== */
.plv-hscroll{
  position: sticky; top: 0; z-index: 12;
  height: 14px; overflow-x: auto; overflow-y: hidden;
  background: transparent; margin: 4px 0 10px; border-radius: 9999px;
}
.plv-hscroll::-webkit-scrollbar { height: 12px; }
.plv-hscroll::-webkit-scrollbar-track { background: var(--line); border-radius: 9999px; }
.plv-hscroll::-webkit-scrollbar-thumb { background: var(--blue-soft); border-radius: 9999px; }
.plv-hscroll { scrollbar-color: var(--blue-soft) var(--line); scrollbar-width: thin; }
.plv-hscroll-inner{ height: 1px; }

/* ===== 表格卡片 ===== */
.plv-table-card{
  border-radius: 14px; background: var(--card);
  box-shadow: 0 6px 18px rgba(17,24,39,.06), 0 2px 6px rgba(17,24,39,.04);
  border: 1px solid var(--line);
}
.plv-table-wrap{
  overflow-x: auto; border-radius: 14px;
}

/* ===== 表格 ===== */
.plv-table{
  width: max-content; min-width: 100%;
  border-collapse: separate; border-spacing: 0; font-size: 14px;
}
.plv-table thead th{
  position: sticky; top: 0; z-index: 1;
  background: #fafafa;
  color: var(--text-2); font-weight: 600;
  padding: 12px 14px; white-space: nowrap;
  border-bottom: 1px solid var(--line);
}
.plv-table tbody td{
  padding: 12px 14px; border-bottom: 1px solid var(--line);
  vertical-align: middle; color: var(--text);
}
.plv-table tbody tr:nth-child(even){ background: #fbfbfd; }
.plv-table tbody tr:hover{ background: #f6f7fb; }

/* 欄寬 */
.col-select{ width: var(--w-select); text-align: center; }
.col-code{   width: var(--w-code); }
.col-name{   width: var(--w-name); }
.col-price{  width: var(--w-price); }
.col-color{  width: var(--w-color); }
.col-cat{    width: var(--w-cat); }
.col-midcat{ width: var(--w-midcat); }
.col-desc{   width: var(--w-desc); }
.col-date{   width: var(--w-date); }
.col-qty{    width: var(--w-qty); text-align: right; }
.col-thumb{  width: var(--w-thumb); text-align: center; }
.col-flag{   width: var(--w-flag); text-align: center; }
.col-actions{width: var(--w-actions); white-space: nowrap; }

/* 文字處理 */
.ellipsis{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wrap{ white-space: normal; word-break: break-word; }
.num{ text-align: right; font-variant-numeric: tabular-nums; }
.c-center{ text-align: center; }

/* 縮圖 */
.thumb{
  width: 52px; height: 52px; border-radius: 8px; object-fit: cover;
  border: 1px solid var(--line); background: #fafafa;
}

/* 狀態 pill */
.pill{
  display:inline-block; min-width: 36px; padding: 2px 10px; border-radius: 9999px;
  font-size: 12px; font-weight: 700;
}
.pill-ok{ color: #065f46; background: #d1fae5; border: 1px solid #10b981; }
.pill-pending{ color: #4b5563; background: #e5e7eb; border: 1px solid #9ca3af; }

/* 操作列 */
.actions{ display:flex; gap: 8px; align-items:center; }

/* 分頁 */
.pager{ display:flex; gap:12px; justify-content:flex-end; align-items:center; padding: 14px 2px; }

/* 對話框 */
dialog::backdrop{ background: rgba(0,0,0,.35); }
.dialog-card{ width: min(720px, 92vw); background:#fff; border-radius:12px; padding:16px; }
.dialog-card .row{ display:flex; gap:8px; align-items:center; margin:8px 0; }
.dialog-card .row > label{ width:100px; color: var(--muted); }
.dialog-card .row .inline{ display:flex; gap:8px; }
.dialog-card input, .dialog-card select, .dialog-card textarea{
  flex:1 1 auto; border:1px solid var(--line2); border-radius:8px; padding:8px 10px; background:#fff;
}
.dialog-card menu{ display:flex; justify-content:flex-end; gap:10px; margin-top: 8px; }
.img-dlg img{ max-width: 90vw; max-height: 80vh; display:block; }
</style>
