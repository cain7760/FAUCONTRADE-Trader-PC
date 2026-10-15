<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { money, number, price as formatPrice } from '../variantData'
import { currencyFor, moneyWithUnit, sharesWithUnit } from '../tradingPresentation'
import TradingTable from './TradingTable.vue'
import InstructionDetailTable from './InstructionDetailTable.vue'
import ColumnConfigPopover from './ColumnConfigPopover.vue'

const props = defineProps({ orders: { type: Array, default: () => [] }, accounts: { type: Array, default: () => [] }, canChase: { type: Function, required: true }, canAmend: { type: Function, required: true }, canCancel: { type: Function, required: true }, actionLabel: { type: Function, required: true }, detailHeight: { type: Number, default: null } })
const emit = defineEmits(['chase', 'amend', 'cancel', 'bulk-cancel', 'update:detailHeight'])
const columns = [
  ['runStatus', '运行状态', 92], ['status', '指令状态', 80], ['code', '标的代码', 84], ['name', '标的名称', 88],
  ['attribute', '订单属性', 80], ['side', '方向', 62], ['progress', '完成进度', 80],
  ['price', '订单价格', 82], ['quantity', '订单数量/金额', 112], ['reportQuantity', '挂单数量', 94],
  ['filledQuantity', '成交数量', 94], ['filledPrice', '成交均价', 82], ['canceled', '撤单数量/金额', 116],
  ['frozenMargin', '冻结保证金', 128], ['marginRate', '保证金率', 76], ['feedback', '反馈信息', 138],
  ['orderNo', '订单编号', 138], ['orderTime', '下单时间', 150], ['account', '下单账户', 156], ['brokerAccount', '内部上手方账户', 166],
  ['source', '委托方式', 110], ['orderType', '订单类型', 80], ['market', '市场', 58], ['currency', '币种', 56], ['openClose', '开平', 62],
]
const columnOptions = columns.map(([key, label]) => [key, label])
const columnDefaults = columns.map(([key]) => key)
const visibleColumnKeys = ref([...columnDefaults])
const visibleColumns = computed(() => visibleColumnKeys.value.map(key => columns.find(column => column[0] === key)).filter(Boolean))
const childColumns = [
  ['index', '序号', 48], ['code', '标的代码', 84], ['name', '标的名称', 88], ['side', '方向', 62],
  ['status', '委托状态', 80], ['price', '委托限价', 82], ['quantity', '委托数量', 94],
  ['filledPrice', '成交均价', 82], ['filledQuantity', '成交数量', 94], ['filledAmount', '成交金额', 112],
  ['canceledQuantity', '撤单数量', 94], ['attribute', '订单属性', 80], ['orderTime', '下单时间', 150],
  ['filledTime', '成交时间', 150], ['orderNo', '订单编号', 138], ['entrustNo', '委托编号', 138],
  ['account', '下单账户', 156], ['market', '市场', 58], ['source', '委托方式', 110],
  ['feedback', '反馈信息', 138], ['externalInfo', '外部信息', 110], ['openClose', '开平', 62],
]
const dealColumns = [
  ['index', '序号', 48], ['code', '标的代码', 84], ['name', '标的名称', 88], ['side', '方向', 62],
  ['filledPrice', '成交价格', 82], ['filledQuantity', '成交数量', 94], ['filledAmount', '成交金额', 112],
  ['filledTime', '成交时间', 150], ['orderNo', '订单编号', 138], ['entrustNo', '委托编号', 138],
  ['account', '下单账户', 156], ['market', '市场', 58], ['source', '委托方式', 110],
  ['feedback', '反馈信息', 138], ['externalInfo', '外部信息', 110], ['openClose', '开平', 62],
]
const selectedId = ref(null)
const childTab = ref('entrustments')
const table = ref(null)
const selectedRows = ref([])
const workspace = ref(null)
const filterBar = ref(null)
const childPane = ref(null)
const resizeHandle = ref(null)
const availableHeight = ref(0)
const resizingDetail = ref(false)
let resizeStart = null
let resizeObserver = null
function updateAvailableHeight() {
  if (!workspace.value) return
  availableHeight.value = Math.max(0, workspace.value.clientHeight - filterBar.value.offsetHeight - resizeHandle.value.offsetHeight)
}
function clampDetailHeight(height) {
  const available = availableHeight.value
  const minDetail = Math.min(120, available / 2)
  const minMain = Math.min(160, available - minDetail)
  return Math.max(minDetail, Math.min(available - minMain, height))
}
const displayedDetailHeight = computed(() => props.detailHeight == null || !availableHeight.value ? null : clampDetailHeight(props.detailHeight))
const gridRows = computed(() => displayedDetailHeight.value == null ? undefined : `auto minmax(0,1fr) 10px ${displayedDetailHeight.value}px`)
function resizeMove(event) {
  if (!resizeStart || event.pointerId !== resizeStart.pointerId) return
  emit('update:detailHeight', clampDetailHeight(resizeStart.height + resizeStart.y - event.clientY))
}
function stopResize() {
  resizingDetail.value = false
  resizeStart = null
  window.removeEventListener('pointermove', resizeMove)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
}
function startResize(event) {
  if (event.button !== 0) return
  event.preventDefault()
  updateAvailableHeight()
  resizeStart = { pointerId: event.pointerId, y: event.clientY, height: childPane.value.getBoundingClientRect().height }
  resizingDetail.value = true
  event.currentTarget.setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', resizeMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}
function adjustDetailHeight(delta) {
  updateAvailableHeight()
  emit('update:detailHeight', clampDetailHeight(childPane.value.getBoundingClientRect().height + delta))
}
onMounted(() => {
  resizeObserver = new ResizeObserver(updateAvailableHeight)
  resizeObserver.observe(workspace.value)
  resizeObserver.observe(filterBar.value)
})
onBeforeUnmount(() => { stopResize(); resizeObserver?.disconnect() })
const defaultFilters = () => ({ orderNo: '', symbol: '', side: 'ALL', openClose: 'ALL', status: 'ALL' })
const filters = ref(defaultFilters())
const appliedFilters = ref(defaultFilters())
const statusOptions = computed(() => [...new Set(props.orders.map(row => row.status))])
const filteredInstructions = computed(() => instructions.value.filter(row =>
  (!appliedFilters.value.orderNo.trim() || String(row.orderNo || '').toLowerCase().includes(appliedFilters.value.orderNo.trim().toLowerCase()))
  && (!appliedFilters.value.symbol.trim() || `${row.code}${row.name}`.toLowerCase().includes(appliedFilters.value.symbol.trim().toLowerCase()))
  && (appliedFilters.value.side === 'ALL' || row.side === appliedFilters.value.side)
  && (appliedFilters.value.openClose === 'ALL' || row.openClose === appliedFilters.value.openClose)
  && (appliedFilters.value.status === 'ALL' || row.status === appliedFilters.value.status)
))
const selectedCancelable = computed(() => {
  const visible = new Set(filteredInstructions.value.map(row => row.id))
  return selectedRows.value.filter(row => visible.has(row.id) && props.canCancel(props.orders.find(item => item.id === row.id) || row))
})
function applyFilters() { appliedFilters.value = { ...filters.value } }
function resetFilters() { filters.value = defaultFilters(); appliedFilters.value = defaultFilters() }
defineExpose({ clearSelection: () => { table.value?.clearSelection(); selectedRows.value = [] } })
const accountName = id => { const account = props.accounts.find(item => item.id === id); return account ? `${id} - ${account.name}` : id || '--' }
const amountOrQuantity = row => row.inputAmount != null || row.orderValueMode === 'amount' ? moneyWithUnit(row.orderValueNumber ?? row.inputAmount ?? row.estimate) : sharesWithUnit(row.quantity)
const cancelValue = row => row.canceledAmount ? `${money(row.canceledAmount)} CNY` : row.canceledQuantity ? `${number(row.canceledQuantity)} 股` : '--'
const numericColumns = new Set(['price', 'quantity', 'reportQuantity', 'filledQuantity', 'filledPrice', 'canceled', 'frozenMargin', 'marginRate'])
const progress = row => row.quantity ? Math.min(100, Math.round((row.filledQuantity || 0) / row.quantity * 100)) : 0
const shown = (row, key) => {
  switch (key) {
    case 'runStatus': return row.runStatus || (['异常', '拒绝'].includes(row.status) ? '异常' : '正常')
    case 'attribute': return row.type === 'market' ? '市价单' : '限价单'
    case 'openClose': return row.openClose === '开' ? '开仓' : '平仓'
    case 'side': return row.side === 'buy' ? '买入' : '卖出'
    case 'price': return row.price == null ? '市价' : formatPrice(row.price, row.market)
    case 'quantity': return amountOrQuantity(row)
    case 'reportQuantity': case 'filledQuantity': case 'canceledQuantity': return sharesWithUnit(row[key] || 0)
    case 'filledPrice': return row.filledPrice == null ? '--' : formatPrice(row.filledPrice, row.market)
    case 'canceled': return cancelValue(row)
    case 'frozenMargin': return moneyWithUnit(row.frozenMargin || 0)
    case 'marginRate': return `${row.marginRate || 0}%`
    case 'filledAmount': return row.filledQuantity && row.filledPrice != null ? moneyWithUnit(row.filledQuantity * row.filledPrice) : '--'
    case 'account': return accountName(row.account)
    case 'brokerAccount': return row.brokerAccountLabel || row.brokerAccountId || '--'
    case 'source': return row.source || 'Customer客户端'
    case 'market': return row.market === 'HK' ? '港股' : 'A股'
    case 'currency': return currencyFor(row)
    case 'index': return row.index
    default: return row[key] || '--'
  }
}
const mainShown = (row, key) => ['quantity', 'canceled', 'frozenMargin'].includes(key)
  ? shown(row, key).replace(/\s(?:CNY|HKD|USD)$/, '')
  : shown(row, key)
const statusTone = (status) => ({
  正常: 'success', 异常: 'rejected', 拒绝: 'rejected',
  已撤: 'draft', 暂停: 'pending', 完成: 'success', 部成: 'partial',
  已报: 'reported', 待报: 'pending', 改单中: 'review',
}[status] || 'draft')
// 演示数据没有独立委托接口；仅为已经报出的样本生成一条关联委托。
const instructions = computed(() => props.orders.map(row => ({ ...row, entrustments: row.entrustments || (
  ['已报', '部成', '完成', '已撤'].includes(row.status)
    ? [{ ...row, index: 1, status: row.status, entrustNo: row.entrustNo || `${row.orderNo}-01`, filledTime: row.filledTime || '', externalInfo: row.externalInfo || '' }]
    : []
) })))
watch(filteredInstructions, rows => {
  if (!rows.some(row => row.id === selectedId.value)) selectedId.value = rows[0]?.id ?? null
}, { immediate: true })
const selected = computed(() => filteredInstructions.value.find(row => row.id === selectedId.value))
const submittedDeals = computed(() => {
  const row = selected.value
  if (!row) return []
  if (Array.isArray(row.deals)) return row.deals
  if (!row.filledQuantity || row.filledPrice == null) return []
  return [{ ...row, index: 1, entrustNo: row.entrustNo || `${row.orderNo}-01`, filledTime: row.filledTime || '', externalInfo: row.externalInfo || '' }]
})
const detailRows = computed(() => childTab.value === 'entrustments' ? selected.value?.entrustments || [] : submittedDeals.value)
const detailColumns = computed(() => childTab.value === 'entrustments' ? childColumns : dealColumns)
</script>

<template>
  <div ref="workspace" class="instruction-workspace" :class="{ 'is-resizing': resizingDetail }" :style="{ gridTemplateRows: gridRows }">
  <div ref="filterBar" class="instruction-filters">
    <button type="button" class="instruction-bulk-cancel" :disabled="!selectedCancelable.length" @click="emit('bulk-cancel', selectedCancelable.map(row => row.id))">批量撤单<span v-if="selectedCancelable.length"> ({{ selectedCancelable.length }})</span></button>
    <el-input v-model="filters.orderNo" aria-label="筛选订单编号" placeholder="订单编号" clearable @keyup.enter="applyFilters" />
    <el-input v-model="filters.symbol" aria-label="筛选标的物" placeholder="标的物" clearable @keyup.enter="applyFilters" />
    <el-select v-model="filters.side" aria-label="方向筛选" popper-class="variant-popper"><el-option label="方向" value="ALL"/><el-option label="买入" value="buy"/><el-option label="卖出" value="sell"/></el-select>
    <el-select v-model="filters.openClose" aria-label="开平类型筛选" popper-class="variant-popper"><el-option label="开平类型" value="ALL"/><el-option label="开仓" value="开"/><el-option label="平仓" value="平"/></el-select>
    <el-select v-model="filters.status" aria-label="指令状态筛选" popper-class="variant-popper"><el-option label="指令状态" value="ALL"/><el-option v-for="value in statusOptions" :key="value" :label="value" :value="value"/></el-select>
    <button type="button" class="instruction-query" @click="applyFilters">查询</button>
    <button type="button" class="instruction-reset" @click="resetFilters">重置</button>
  </div>
  <TradingTable ref="table" class="instruction-table orders-table original-fields" :data="filteredInstructions" row-key="id" :current-row-key="selectedId" highlight-current-row height="100%" :fit="false" empty-text="暂无指令" copyable-identifiers @current-change="row => { if (row) selectedId = row.id }" @selection-change="rows => selectedRows = rows">
    <el-table-column type="selection" width="40" fixed="left" class-name="instruction-selection-column" label-class-name="instruction-selection-column" :selectable="canCancel" />
    <el-table-column v-for="[key, label, width] in visibleColumns" :key="key" :label="label" :width="width" :align="numericColumns.has(key) ? 'right' : 'left'" :header-align="numericColumns.has(key) ? 'right' : 'left'" :class-name="key === 'frozenMargin' ? 'frozen-margin-column' : ''" :label-class-name="key === 'frozenMargin' ? 'frozen-margin-column' : ''" show-overflow-tooltip>
      <template #default="{ row }">
        <span v-if="key === 'progress'" class="instruction-progress">
          <svg class="instruction-progress-ring" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="instruction-progress-ring-track" cx="12" cy="12" r="9" />
            <circle class="instruction-progress-ring-value" cx="12" cy="12" r="9" pathLength="100" :stroke-dasharray="`${progress(row)} 100`" />
          </svg>
          <span>{{ progress(row) }}%</span>
        </span>
        <span v-else-if="key === 'runStatus'" class="instruction-run-status" :class="{ 'is-exception': shown(row, key) === '异常' }"><i aria-hidden="true" />{{ shown(row, key) }}</span>
        <span v-else-if="key === 'status'" class="order-status" :class="`is-${statusTone(shown(row, key))}`">{{ shown(row, key) }}</span>
        <span v-else>{{ mainShown(row, key) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="96" fixed="right" align="center" class-name="operation-column" label-class-name="operation-column">
      <template #header><span class="operation-column-header"><span>操作</span><ColumnConfigPopover v-model="visibleColumnKeys" :options="columnOptions" :defaults="columnDefaults" :label-overrides="{ status: '指令状态', orderTime: '下单时间' }" /></span></template>
      <template #default="{ row }"><div class="order-row-actions">
        <el-tooltip :content="actionLabel(row, '追加订单')" placement="top" :show-after="300" popper-class="variant-popper order-action-popper"><span class="operation-tooltip"><button type="button" class="order-chase-action" :aria-label="actionLabel(row, '追加订单')" :disabled="!canChase(row)" @click.stop="emit('chase', row)">追</button></span></el-tooltip>
        <el-tooltip :content="actionLabel(row, '修改订单')" placement="top" :show-after="300" popper-class="variant-popper order-action-popper"><span class="operation-tooltip"><button type="button" class="order-amend-action" :aria-label="actionLabel(row, '修改订单')" :disabled="!canAmend(row)" @click.stop="emit('amend', row)">改</button></span></el-tooltip>
        <el-tooltip :content="actionLabel(row, '撤单')" placement="top" :show-after="300" popper-class="variant-popper order-action-popper"><span class="operation-tooltip"><button type="button" class="order-cancel-action" :aria-label="actionLabel(row, '撤单')" :disabled="!canCancel(row)" @click.stop="emit('cancel', row)">撤</button></span></el-tooltip>
      </div></template>
    </el-table-column>
  </TradingTable>
  <button ref="resizeHandle" type="button" class="instruction-resize-handle" aria-label="调整申报明细高度" title="拖动调整高度；方向键微调" @pointerdown="startResize" @keydown.up.prevent="adjustDetailHeight(24)" @keydown.down.prevent="adjustDetailHeight(-24)"><span /></button>
  <section ref="childPane" class="instruction-child" :aria-label="selected ? `${selected.orderNo}的申报明细` : '申报明细'">
    <header class="instruction-child-tabs">
      <button type="button" :class="{ active: childTab === 'entrustments' }" @click="childTab = 'entrustments'">申报委托</button>
      <button type="button" :class="{ active: childTab === 'deals' }" @click="childTab = 'deals'">申报成交</button>
      <span v-if="selected" class="instruction-selected">{{ selected.name }} · {{ selected.orderNo }}　共 {{ detailRows.length }} 条</span>
    </header>
    <InstructionDetailTable :rows="detailRows" :columns="detailColumns" :shown="shown" :empty-text="selected ? childTab === 'entrustments' ? '暂无申报委托' : '暂无申报成交' : '请选择上方指令'" />
  </section>
  </div>
</template>

<style>
.variants-app .positions-tabs:has(+ .instruction-workspace) .global-account-filter{flex-basis:142px;width:142px}.instruction-workspace{display:grid;grid-template-rows:auto minmax(0,1fr) minmax(0,1fr);flex:1;min-height:0}.instruction-filters{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:40px;padding:6px 8px;border-bottom:1px solid #303338}.instruction-filters>.el-select{width:94px}.instruction-filters>.el-input{width:130px}.instruction-filters .el-select__wrapper,.instruction-filters .el-input__wrapper{min-height:26px;background:#202328;box-shadow:0 0 0 1px #3b4149 inset}.instruction-filters>button{height:26px;padding:0 7px;border:1px solid #454a52;border-radius:3px;background:#282c32;color:#c7ced8;font-size:11px;white-space:nowrap;cursor:pointer}.instruction-filters>.instruction-bulk-cancel{margin-left:auto;border-color:#80515a;color:#e6a6af}.instruction-filters>.instruction-bulk-cancel:not(:disabled):hover{background:#493038}.instruction-filters>.instruction-bulk-cancel:disabled{opacity:.45;cursor:not-allowed}.instruction-workspace>.el-table,.instruction-child>.el-table{min-height:0!important}.instruction-table .el-table__body tr{cursor:pointer}.variants-app .positions-pane .instruction-table .el-table__body tr.current-row>td.el-table__cell,.variants-app .positions-pane .instruction-table .el-table__body tr.current-row.hover-row>td.el-table__cell{background:#30343c!important;color:#e8eaed}.variants-app .positions-pane .instruction-table .el-table__body tr.current-row>td.el-table__cell:first-child{box-shadow:inset 2px 0 #bb984a}.instruction-table .instruction-progress{display:flex;align-items:center;gap:7px}.instruction-progress-track{width:66px;height:4px;border-radius:3px;background:#41464e}.instruction-progress-track i{display:block;height:100%;border-radius:3px;background:#bb984a}.instruction-exception{color:#db8490}.instruction-child{display:flex;flex-direction:column;min-width:0;min-height:0;border-top:1px solid #3b4048;background:#191c20}.instruction-child-tabs{display:flex;align-items:center;gap:18px;height:38px;padding:0 12px;border-bottom:1px solid #303338}.instruction-child-tabs button{height:100%;padding:0 2px;border:0;border-bottom:2px solid transparent;background:transparent;color:#969eaa;font-size:12px;cursor:pointer}.instruction-child-tabs button.active{border-bottom-color:#bb984a;color:#e8eaed}.instruction-selected{margin-left:auto;overflow:hidden;color:#8993a1;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.instruction-child .el-table{max-width:100%}
.variants-app .positions-pane > .positions-tabs{gap:24px}
.variants-app .instruction-selected{color:#bb984a}
.variants-app .instruction-table .instruction-selection-column .el-checkbox{transform:translateX(6px)}
.variants-app .instruction-table .instruction-selection-column .cell{overflow:visible}
.variants-app .instruction-table .instruction-run-status{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:54px;height:20px;color:#79bfa8;font-size:11px;white-space:nowrap}
.variants-app .instruction-table .instruction-run-status i{width:6px;height:6px;border-radius:50%;background:currentColor}
.variants-app .instruction-table .instruction-run-status.is-exception{color:#e18a96}
.variants-app .instruction-table .instruction-progress{display:inline-flex;align-items:center;gap:6px;vertical-align:middle;white-space:nowrap;font-variant-numeric:tabular-nums}
.variants-app .instruction-table .instruction-progress-ring{width:20px;height:20px;flex:none;transform:rotate(-90deg)}
.variants-app .instruction-table .instruction-progress-ring circle{fill:none;stroke-width:2.5}
.variants-app .instruction-table .instruction-progress-ring-track{stroke:#41464e}
.variants-app .instruction-table .instruction-progress-ring-value{stroke:#bb984a;stroke-linecap:round}
.instruction-workspace{grid-template-rows:auto minmax(0,1fr) 10px minmax(0,1fr)}
.instruction-resize-handle{z-index:1;display:grid;place-items:center;width:100%;height:10px;padding:0;border:0;background:transparent;cursor:ns-resize;touch-action:none}
.instruction-resize-handle span{display:block;width:28px;height:3px;border-radius:3px;background:#535961;transition:background .15s ease}
.instruction-resize-handle:hover span,.instruction-resize-handle:focus-visible span,.instruction-workspace.is-resizing .instruction-resize-handle span{background:#c7a655}
.instruction-resize-handle:focus-visible{outline:none}
.instruction-resize-handle:focus-visible span{box-shadow:0 0 0 2px #bb984a66}
.instruction-workspace.is-resizing{user-select:none}
.variants-app .instruction-filters>.el-input{--el-input-height:26px;height:26px}
.variants-app .instruction-filters .el-input__wrapper,.variants-app .instruction-filters .el-select__wrapper{box-sizing:border-box;height:26px;min-height:26px}
.variants-app .instruction-filters .el-select__wrapper{padding-top:0;padding-bottom:0}
.instruction-filters>.instruction-bulk-cancel{margin-left:0;margin-right:14px}
.bulk-cancel-dialog .el-dialog__footer{display:flex;justify-content:center;gap:8px}.bulk-cancel-dialog .el-dialog__footer .el-button{min-width:112px;margin:0}.bulk-cancel-dialog .el-button--primary{border-color:#8b424d!important;background:#8b424d!important}
</style>
