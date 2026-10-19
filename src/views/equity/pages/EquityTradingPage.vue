<script setup>
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { tradingContextKey } from '../tradingContext'
import { ArrowDownBold, Search, View, Hide, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { accounts, brokerAccounts } from '../fixtures'
import { marketInstruments, variants, money, number, price as formatPrice } from '../variantData'
import BaseDialog from '../../../components/BaseDialog.vue'
import OrderTicket from '../components/OrderTicket.vue'
import OrderBook from '../components/OrderBook.vue'
import ClosePositionDialog from '../components/ClosePositionDialog.vue'
import ChaseOrderDialog from '../components/ChaseOrderDialog.vue'
import AmendOrderDialog from '../components/AmendOrderDialog.vue'
import OrderHistoryDialog from '../components/OrderHistoryDialog.vue'
import PositionsTable from '../components/PositionsTable.vue'
import OrdersTable from '../components/OrdersTable.vue'
import TradesTable from '../components/TradesTable.vue'
import InstructionTable from '../components/InstructionTable.vue'
const instructionDetailHeight = ref(null)
const { assetUrl, variant, systemRunning, transactionToasts, messageIcon, allAccountsValue, workspace, selectedAccountIds, market, globalAccountSearch, assetsVisible, assetsCollapsed, tab, selectedCode, quote, ticketResetKey, ticketContext, closePositionVisible, closingPosition, chaseOrderVisible, chasingPosition, chasingOrder, amendOrderVisible, amendingOrder, cancelOrderVisible, cancelingOrder, bulkCancelVisible, bulkCancelIds, instructionTable, convertManualVisible, convertingManualOrder, conversionRemark, historyVisible, historyRecord, demoOrders, dock, collapsed, dragging, resizing, floating, start, startResize, isTicketLayoutModified, account, closingAccount, chasingAccount, amendingAccount, amendingSymbol, effectiveAccountIds, filteredGlobalAccounts, instruments, selected, allRows, assetSummaryMetrics, orders, trades, positionRowsForAccounts, ordersForAccounts, tradesForAccounts, floatStyle, resetTicketLayout, toggleSystemStatus, dismissTransactionToast, accountLabel, marketLabel, tradeStatusLabel, tradeStatusVisual, toggleAssetsVisible, updateGlobalAccountSelection, handleGlobalAccountVisible, selectTicketAccount, assetAmountParts, acceptOrder, acceptClosePosition, acceptChaseOrder, cancelableQuantity, canOperateOrder, canChaseOrder, canAmendOrder, canConvertToManual, orderActionLabel, openOrderChase, openCancelOrder, openBulkCancel, openConvertToManual, confirmConvertToManual, openAmendOrder, acceptAmendOrder, confirmCancelOrder, confirmBulkCancel } = inject(tradingContextKey)

const tabIds = ['positions', 'instructions', 'orders', 'trades']
const tabLabels = { positions: '所有持仓', instructions: '所有指令', orders: '所有订单', trades: '所有成交' }
const accountInstructions = computed(() => demoOrders.value.filter(order => effectiveAccountIds.value.includes(order.account)))
const detachedTabs = reactive({})
function detachedAccountIds(id) {
  const ids = detachedTabs[id]?.accountIds || []
  return ids.includes(allAccountsValue) ? accounts.map(item => item.id) : ids
}
const tabCounts = computed(() => ({
  positions: detachedTabs.positions ? positionRowsForAccounts(detachedAccountIds('positions')).allRows.length : allRows.value.length,
  instructions: detachedTabs.instructions ? demoOrders.value.filter(order => detachedAccountIds('instructions').includes(order.account)).length : accountInstructions.value.length,
  orders: detachedTabs.orders ? ordersForAccounts(detachedAccountIds('orders')).length : orders.value.length,
  trades: detachedTabs.trades ? tradesForAccounts(detachedAccountIds('trades')).length : trades.value.length,
}))
const tabDragPreview = ref(null)
const restoreDropTarget = ref(null)
let topWindowLevel = 60
let stopPointerTracking = null
let suppressTabClick = null

function firstDockedTab() {
  return tabIds.find(id => !detachedTabs[id]) || null
}

function tabBarClearance() {
  return (workspace.value?.querySelector('.positions-tabs')?.offsetHeight || 36) + 8
}

function isOverTabBar(clientX, clientY) {
  const bounds = workspace.value?.querySelector('.positions-tabs')?.getBoundingClientRect()
  return !!bounds && clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom
}

function bringTabForward(id) {
  if (detachedTabs[id]) detachedTabs[id].zIndex = ++topWindowLevel
}

function selectTab(id) {
  if (suppressTabClick === id) {
    suppressTabClick = null
    return
  }
  if (detachedTabs[id]) bringTabForward(id)
  else tab.value = id
}

function detachTab(id, clientX, clientY) {
  if (detachedTabs[id] || !workspace.value) return
  if (tabIds.filter(item => !detachedTabs[item]).length <= 1) {
    ElMessage.warning('至少保留一个标签在主区域')
    return
  }
  const bounds = workspace.value.getBoundingClientRect()
  const minY = tabBarClearance()
  const width = Math.min(680, Math.max(300, bounds.width - 20))
  const height = Math.min(480, Math.max(240, bounds.height - minY - 8))
  detachedTabs[id] = {
    x: Math.max(0, Math.min(clientX - bounds.left - 24, bounds.width - width)),
    y: Math.max(minY, Math.min(clientY - bounds.top - 18, bounds.height - height)),
    width,
    height,
    maximized: false,
    zIndex: ++topWindowLevel,
    accountIds: [...selectedAccountIds.value],
    previousAccountIds: [...selectedAccountIds.value],
    accountSearch: '',
  }
  if (tab.value === id) tab.value = firstDockedTab()
}

function restoreTab(id) {
  delete detachedTabs[id]
  tab.value = id
}

function toggleWindowMaximize(id) {
  const floatingTab = detachedTabs[id]
  if (!floatingTab) return
  floatingTab.maximized = !floatingTab.maximized
  bringTabForward(id)
}

function detachedWindowStyle(id) {
  const floatingTab = detachedTabs[id]
  return floatingTab.maximized
    ? { left: '0', top: '0', width: '100vw', height: '100vh', zIndex: floatingTab.zIndex }
    : { left: `${floatingTab.x}px`, top: `${floatingTab.y}px`, width: `${floatingTab.width}px`, height: `${floatingTab.height}px`, zIndex: floatingTab.zIndex }
}

function updateDetachedAccountSelection(id, ids) {
  const floatingTab = detachedTabs[id]
  const hadAll = floatingTab.previousAccountIds.includes(allAccountsValue)
  const hasAll = ids.includes(allAccountsValue)
  if (!ids.length || (hasAll && !hadAll)) floatingTab.accountIds = [allAccountsValue]
  else if (hasAll && hadAll && ids.length > 1) floatingTab.accountIds = ids.filter(value => value !== allAccountsValue)
  floatingTab.previousAccountIds = [...floatingTab.accountIds]
}

function filteredDetachedAccounts(id) {
  const keyword = detachedTabs[id].accountSearch.trim().toLowerCase()
  return keyword ? accounts.filter(item => accountLabel(item.id).toLowerCase().includes(keyword)) : accounts
}

function setInstructionTableInstance(instance) {
  instructionTable.value = instance
}

function trackPointer(event, onMove, onEnd) {
  stopPointerTracking?.()
  const pointerId = event.pointerId
  const move = next => { if (next.pointerId === pointerId) onMove(next) }
  const finish = next => {
    if (next.pointerId !== pointerId) return
    stopPointerTracking?.()
    onEnd(next)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', finish)
  window.addEventListener('pointercancel', finish)
  stopPointerTracking = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', finish)
    window.removeEventListener('pointercancel', finish)
    stopPointerTracking = null
  }
}

function beginTabDrag(id, event) {
  if (event.button !== 0 || detachedTabs[id]) return
  const startX = event.clientX
  const startY = event.clientY
  if (tabIds.filter(item => !detachedTabs[item]).length <= 1) {
    let warned = false
    trackPointer(event, next => {
      if (!warned && Math.hypot(next.clientX - startX, next.clientY - startY) >= 10) {
        warned = true
        ElMessage.warning('至少保留一个标签在主区域')
      }
    }, () => {})
    return
  }
  const header = event.currentTarget.parentElement
  let moved = false
  trackPointer(event, next => {
    if (!moved && Math.hypot(next.clientX - startX, next.clientY - startY) < 10) return
    moved = true
    suppressTabClick = id
    tabDragPreview.value = { label: tabLabels[id], x: next.clientX + 12, y: next.clientY + 12 }
  }, next => {
    tabDragPreview.value = null
    if (!moved) return
    setTimeout(() => { if (suppressTabClick === id) suppressTabClick = null }, 0)
    if (next.type === 'pointercancel') return
    const bounds = header.getBoundingClientRect()
    if (next.clientX < bounds.left || next.clientX > bounds.right || next.clientY < bounds.top || next.clientY > bounds.bottom) {
      detachTab(id, next.clientX, next.clientY)
    }
  })
}

function beginWindowDrag(id, event) {
  if (event.button !== 0 || detachedTabs[id].maximized || event.target.closest('button')) return
  event.preventDefault()
  bringTabForward(id)
  restoreDropTarget.value = null
  const floatingTab = detachedTabs[id]
  const startX = event.clientX
  const startY = event.clientY
  const x = floatingTab.x
  const y = floatingTab.y
  trackPointer(event, next => {
    const bounds = workspace.value.getBoundingClientRect()
    floatingTab.x = Math.max(0, Math.min(x + next.clientX - startX, bounds.width - floatingTab.width))
    floatingTab.y = Math.max(tabBarClearance(), Math.min(y + next.clientY - startY, bounds.height - floatingTab.height))
    restoreDropTarget.value = isOverTabBar(next.clientX, next.clientY) ? id : null
  }, next => {
    const shouldRestore = next.type === 'pointerup' && isOverTabBar(next.clientX, next.clientY)
    restoreDropTarget.value = null
    if (shouldRestore) restoreTab(id)
  })
}

function beginWindowResize(id, event) {
  if (event.button !== 0 || detachedTabs[id].maximized) return
  event.preventDefault()
  event.stopPropagation()
  bringTabForward(id)
  const floatingTab = detachedTabs[id]
  const startX = event.clientX
  const startY = event.clientY
  const width = floatingTab.width
  const height = floatingTab.height
  trackPointer(event, next => {
    const bounds = workspace.value.getBoundingClientRect()
    floatingTab.width = Math.max(300, Math.min(width + next.clientX - startX, bounds.width - floatingTab.x))
    floatingTab.height = Math.max(240, Math.min(height + next.clientY - startY, bounds.height - floatingTab.y))
  }, () => {})
}

watch(tab, (id, previous) => {
  if (id && detachedTabs[id]) {
    bringTabForward(id)
    tab.value = previous && !detachedTabs[previous] ? previous : firstDockedTab()
  }
})
onBeforeUnmount(() => stopPointerTracking?.())
</script>

<template>
    <aside class="transaction-toast-stack" aria-live="polite" aria-label="订单结果提示">
      <transition-group name="transaction-toast">
        <article v-for="toast in transactionToasts" :key="toast.message.id" class="transaction-toast-card">
          <header><span class="transaction-toast-type"><img :src="messageIcon('消息')" alt="">权益交易 · 订单回报</span><span class="transaction-toast-countdown">{{ toast.remaining }}s 后自动关闭</span><button type="button" :aria-label="`关闭${toast.message.title}`" @click="dismissTransactionToast(toast.message.id)"><el-icon><Close /></el-icon></button></header>
          <p class="transaction-toast-instrument"><span>{{ toast.message.trade.name }}</span><small>（{{ toast.message.trade.code }}）</small><em :class="`is-${tradeStatusVisual(toast.message.trade.status).tone}`"><el-icon><component :is="tradeStatusVisual(toast.message.trade.status).icon" /></el-icon>{{ tradeStatusLabel(toast.message.trade.status) }}</em></p>
          <dl class="transaction-toast-metrics"><div><dt>{{ toast.message.trade.quantityLabel || '成交数量' }}</dt><dd>{{ toast.message.trade.quantity ? `${number(toast.message.trade.quantity)} 股` : '--' }}</dd></div><div><dt>{{ toast.message.trade.priceLabel || '成交均价' }}</dt><dd>{{ toast.message.trade.price !== null ? `${money(toast.message.trade.price)} CNY` : '--' }}</dd></div></dl>
        </article>
      </transition-group>
    </aside>
    <div ref="workspace" class="variants-workspace" :class="[`dock-${dock}`,{'ticket-collapsed':collapsed,'is-dragging':dragging}]">
      <section class="positions-pane workspace-panel">
        <header class="positions-tabs" :class="{ 'is-restore-target': restoreDropTarget }"><button v-if="!detachedTabs.positions" :class="{active:tab==='positions'}" title="拖出标签可悬浮，双击可悬浮" @pointerdown="beginTabDrag('positions', $event)" @dblclick="detachTab('positions', $event.clientX, $event.clientY)" @click="selectTab('positions')">所有持仓<span>({{ tabCounts.positions }})</span></button><button v-if="!detachedTabs.instructions" :class="{active:tab==='instructions'}" title="拖出标签可悬浮，双击可悬浮" @pointerdown="beginTabDrag('instructions', $event)" @dblclick="detachTab('instructions', $event.clientX, $event.clientY)" @click="selectTab('instructions')">所有指令<span>({{ tabCounts.instructions }})</span></button><button v-if="!detachedTabs.orders" :class="{active:tab==='orders'}" title="拖出标签可悬浮，双击可悬浮" @pointerdown="beginTabDrag('orders', $event)" @dblclick="detachTab('orders', $event.clientX, $event.clientY)" @click="selectTab('orders')">所有订单<span>({{ tabCounts.orders }})</span></button><button v-if="!detachedTabs.trades" :class="{active:tab==='trades'}" title="拖出标签可悬浮，双击可悬浮" @pointerdown="beginTabDrag('trades', $event)" @dblclick="detachTab('trades', $event.clientX, $event.clientY)" @click="selectTab('trades')">所有成交<span>({{ tabCounts.trades }})</span></button><el-select v-model="selectedAccountIds" class="global-account-filter" multiple collapse-tags :max-collapse-tags="1" placeholder="下单账户" aria-label="全局下单账户筛选" popper-class="variant-popper global-account-popper" :offset="2" @visible-change="handleGlobalAccountVisible" @change="updateGlobalAccountSelection"><template #header><div class="account-dropdown-search" @click.stop><el-input v-model="globalAccountSearch" :prefix-icon="Search" placeholder="搜索下单账户" clearable /></div></template><el-option label="全部账户" :value="allAccountsValue" /><el-option v-for="option in filteredGlobalAccounts" :key="option.id" :label="accountLabel(option.id)" :value="option.id" /></el-select><button v-if="collapsed" class="workspace-restore-ticket" @click="collapsed=false"><img class="restore-panel-icon" :src="assetUrl('panel-expand.svg')" alt=""><span class="restore-panel-label">展开下单面板</span></button><span v-if="restoreDropTarget" class="tab-restore-cue">松开还原{{ tabLabels[restoreDropTarget] }}</span></header>
        <template v-if="tab==='instructions'">
          <InstructionTable :ref="setInstructionTableInstance" v-model:detail-height="instructionDetailHeight" :orders="accountInstructions" :accounts="accounts" :can-chase="canChaseOrder" :can-amend="canAmendOrder" :can-cancel="canOperateOrder" :action-label="orderActionLabel" @chase="openOrderChase" @amend="openAmendOrder" @cancel="openCancelOrder" @bulk-cancel="openBulkCancel" />
        </template>
        <PositionsTable v-else-if="tab==='positions'" />
        <OrdersTable v-else-if="tab==='orders'" />
        <TradesTable v-else-if="tab==='trades'" />
        <div v-else class="detached-empty">表格已悬浮，关闭窗口可还原到标签栏</div>
      </section>
      <section class="trade-dock" :class="{floating:dock==='floating', resizing, 'assets-collapsed':assetsCollapsed}" :style="floatStyle">
        <OrderBook v-show="!collapsed" :symbol="selected" :compact="dock === 'bottom'" @drag="start" @quote="value=>{quote=value;collapsed=false}" />
        <section v-show="!collapsed" class="ticket-pane workspace-panel">
          <header class="module-heading drag-heading" @pointerdown="start"><span class="drag-title"><span class="drag-grip" aria-hidden="true"><i v-for="n in 8" :key="n" /></span><h2>交易订单</h2></span><span class="ticket-layout-actions"><el-tooltip v-if="isTicketLayoutModified" content="将面板重置到默认位置" placement="top" popper-class="ticket-reset-popper"><button type="button" aria-label="将面板重置到默认位置" class="reset-ticket-layout" @pointerdown.stop @click="resetTicketLayout"><svg class="reset-layout-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2.5H2.5V6m7.5-3.5h3.5V6M10 13.5h3.5V10M6 13.5H2.5V10M5 8h6m-2.5-2.5L11 8l-2.5 2.5" /></svg></button></el-tooltip><button aria-label="收起交易区域" class="collapse-ticket" @pointerdown.stop @click="collapsed=true"><img :src="assetUrl('panel-collapse.svg')" alt=""></button></span></header>
          <OrderTicket :key="ticketResetKey" :instruments="marketInstruments" :accounts="accounts" :broker-accounts="brokerAccounts" :symbol="selected" :account="account" :quote="quote" :paused="!systemRunning" :ticket-context="ticketContext" @account-select="selectTicketAccount" @select="code=>{ selectedCode=code; if (!code) quote=null }" @order="acceptOrder" />
        </section>
        <section v-show="!collapsed" class="compact-assets ticket-assets" :class="{ 'is-collapsed': assetsCollapsed }" aria-label="资产账户概要">
          <div class="asset-summary-heading"><span>资产账户概要</span><button class="asset-visibility" type="button" :aria-label="assetsVisible ? '隐藏资金数值' : '查看资金数值'" @click="toggleAssetsVisible"><el-icon><View v-if="assetsVisible" /><Hide v-else /></el-icon></button><button class="asset-collapse" type="button" :aria-label="assetsCollapsed ? '展开资产账户概要' : '收起资产账户概要'" @click="assetsCollapsed=!assetsCollapsed"><el-icon><ArrowDownBold /></el-icon></button></div>
          <div v-show="!assetsCollapsed" class="asset-summary-grid">
            <div v-for="metric in assetSummaryMetrics" :key="metric.key" class="asset-metric" :class="metric.tone">
              <span>{{ metric.label }}</span>
              <el-tooltip v-if="assetsVisible && metric.value !== null" placement="top" popper-class="asset-value-popper"><template #content><span class="asset-large-value" :class="metric.tone"><template v-for="part in assetAmountParts(metric.value)" :key="`${part.value}${part.unit}`"><b>{{ part.value }}</b><i v-if="part.unit">{{ part.unit }}</i></template></span></template><b class="asset-number">{{ money(metric.value) }}</b></el-tooltip>
              <b v-else class="asset-number">{{ assetsVisible ? '--' : '••••••••' }}</b><small>CNY</small>
            </div>
          </div>
        </section>
        <button v-if="dock === 'floating'" type="button" class="floating-resize-handle" aria-label="调整下单面板高度" @pointerdown="startResize"><span></span></button>
      </section>
      <div v-if="dragging" class="dock-targets"><div class="dock-target target-left">停靠左侧</div><div class="dock-target target-right">停靠右侧</div><div class="dock-target target-bottom">停靠底部</div><span class="float-instruction">拖至边缘停靠 · 放在中间悬浮</span></div>
      <section v-for="id in tabIds.filter(item => detachedTabs[item])" :key="id" class="positions-pane workspace-panel detached-tab-window" :class="{ 'is-maximized': detachedTabs[id].maximized }" :style="detachedWindowStyle(id)" @pointerdown="bringTabForward(id)">
        <header class="detached-tab-header" @pointerdown="beginWindowDrag(id, $event)"><strong>{{ tabLabels[id] }}<span class="detached-tab-count">({{ tabCounts[id] }})</span></strong><el-select v-model="detachedTabs[id].accountIds" class="global-account-filter detached-account-filter" multiple collapse-tags :max-collapse-tags="1" placeholder="下单账户" :aria-label="`${tabLabels[id]}下单账户筛选`" popper-class="variant-popper global-account-popper" :offset="2" @pointerdown.stop @visible-change="visible => { if (!visible) detachedTabs[id].accountSearch = '' }" @change="ids => updateDetachedAccountSelection(id, ids)"><template #header><div class="account-dropdown-search" @click.stop><el-input v-model="detachedTabs[id].accountSearch" :prefix-icon="Search" placeholder="搜索下单账户" clearable /></div></template><el-option label="全部账户" :value="allAccountsValue" /><el-option v-for="option in filteredDetachedAccounts(id)" :key="option.id" :label="accountLabel(option.id)" :value="option.id" /></el-select><div class="detached-window-actions"><button type="button" :aria-label="`${detachedTabs[id].maximized ? '还原' : '最大化'}${tabLabels[id]}窗口`" :title="detachedTabs[id].maximized ? '还原窗口' : '最大化窗口'" @pointerdown.stop @click="toggleWindowMaximize(id)"><svg v-if="detachedTabs[id].maximized" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 4V2.5h8.5V11H12M2.5 5H11v8.5H2.5z" /></svg><svg v-else viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" /></svg></button><button type="button" class="detached-window-close" :aria-label="`关闭${tabLabels[id]}窗口并还原标签`" title="关闭窗口并还原标签" @pointerdown.stop @click="restoreTab(id)"><el-icon><Close /></el-icon></button></div></header>
        <InstructionTable v-if="id==='instructions'" :ref="setInstructionTableInstance" v-model:detail-height="instructionDetailHeight" :orders="demoOrders.filter(order => detachedAccountIds(id).includes(order.account))" :accounts="accounts" :can-chase="canChaseOrder" :can-amend="canAmendOrder" :can-cancel="canOperateOrder" :action-label="orderActionLabel" @chase="openOrderChase" @amend="openAmendOrder" @cancel="openCancelOrder" @bulk-cancel="openBulkCancel" />
        <PositionsTable v-else-if="id==='positions'" :account-ids="detachedAccountIds(id)" />
        <OrdersTable v-else-if="id==='orders'" :account-ids="detachedAccountIds(id)" />
        <TradesTable v-else :account-ids="detachedAccountIds(id)" />
        <button v-if="!detachedTabs[id].maximized" type="button" class="detached-tab-resize" :aria-label="`调整${tabLabels[id]}窗口大小`" @pointerdown="beginWindowResize(id, $event)"></button>
      </section>
      <div v-if="tabDragPreview" class="tab-drag-preview" :style="{ left:`${tabDragPreview.x}px`, top:`${tabDragPreview.y}px` }">{{ tabDragPreview.label }} · 松开以悬浮</div>
    </div>
    <footer class="variant-status"><span class="system-status"><i class="status-dot" :class="{ 'is-interrupted': !systemRunning }"/>{{ systemRunning ? '运行中' : '系统中断' }} · 演示环境<button type="button" class="system-status-toggle" @click="toggleSystemStatus">{{ systemRunning ? '切换为中断' : '恢复运行' }}</button></span><span>行情：静态快照</span><span class="status-end">系统版本：方案 V0.2</span></footer>
    <ClosePositionDialog v-model="closePositionVisible" :position="closingPosition" :account="closingAccount" :broker-accounts="brokerAccounts" :paused="!systemRunning" @submit="acceptClosePosition" />
    <ChaseOrderDialog :paused="!systemRunning" v-model="chaseOrderVisible" :position="chasingPosition" :order="chasingOrder" :account="chasingAccount" :broker-accounts="brokerAccounts" @submit="acceptChaseOrder" />
    <AmendOrderDialog v-model="amendOrderVisible" :order="amendingOrder" :symbol="amendingSymbol" :account="amendingAccount" :broker-accounts="brokerAccounts" @submit="acceptAmendOrder" />
    <OrderHistoryDialog v-model="historyVisible" :record="historyRecord" />
    <BaseDialog v-model="convertManualVisible" width="680px" align-center append-to-body class="variant-confirm convert-manual-dialog" title="转为手工单" :close-on-press-escape="false">
      <template v-if="convertingManualOrder">
        <p class="convert-manual-intro">转为手工单后，将由交易员直接接入审核；订单编号、价格、数量及异常状态保持不变。</p>
        <el-descriptions class="convert-manual-details" :column="2" border size="small" aria-label="待转换订单信息">
          <el-descriptions-item label="订单编号">{{ convertingManualOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="下单账户">{{ accountLabel(convertingManualOrder.account) }}</el-descriptions-item>
          <el-descriptions-item label="标的">{{ convertingManualOrder.name }}（{{ convertingManualOrder.code }}.{{ convertingManualOrder.market }}）</el-descriptions-item>
          <el-descriptions-item label="市场">{{ marketLabel(convertingManualOrder.market) }}</el-descriptions-item>
          <el-descriptions-item label="交易方向"><span :class="convertingManualOrder.side === 'buy' ? 'is-buy' : 'is-sell'">{{ convertingManualOrder.side === 'buy' ? '买入' : '卖出' }}</span> · {{ convertingManualOrder.openClose === '开' ? '开仓' : '平仓' }}</el-descriptions-item>
          <el-descriptions-item label="原订单类型">{{ convertingManualOrder.orderType }} · {{ convertingManualOrder.attribute || '--' }}</el-descriptions-item>
          <el-descriptions-item label="执行算法">{{ convertingManualOrder.algorithm || '--' }}</el-descriptions-item>
          <el-descriptions-item label="订单价格">{{ convertingManualOrder.price === null ? '市价' : formatPrice(convertingManualOrder.price, convertingManualOrder.market) }}</el-descriptions-item>
          <el-descriptions-item label="订单数量">{{ number(convertingManualOrder.quantity) }} 股</el-descriptions-item>
          <el-descriptions-item label="订单金额">{{ money(convertingManualOrder.estimate) }} CNY</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ convertingManualOrder.status }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ convertingManualOrder.orderTime }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">{{ convertingManualOrder.feedback || '系统处理异常' }}</el-descriptions-item>
          <el-descriptions-item label="原下单备注" :span="2">{{ convertingManualOrder.orderRemark || '--' }}</el-descriptions-item>
        </el-descriptions>
        <label class="convert-manual-remark" for="convert-manual-remark">手工单备注<el-input id="convert-manual-remark" v-model="conversionRemark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入备注，供交易员处理时参考" /></label>
      </template>
      <template #footer><el-button @click="convertManualVisible=false; conversionRemark=''">取消[Esc]</el-button><el-button type="primary" @click="confirmConvertToManual">确认转换[Enter]</el-button></template>
    </BaseDialog>
    <BaseDialog v-model="bulkCancelVisible" width="360px" align-center class="variant-confirm bulk-cancel-dialog" title="批量撤单确认" :teleported="false" :close-on-press-escape="false">
      <p>确定撤销选中的 {{ bulkCancelIds.length }} 条可撤指令？已成交部分不会撤销。</p>
      <template #footer><el-button @click="bulkCancelVisible=false">取消[Esc]</el-button><el-button type="primary" @click="confirmBulkCancel">确认撤单[Enter]</el-button></template>
    </BaseDialog>
    <BaseDialog v-model="cancelOrderVisible" width="360px" class="variant-confirm order-cancel-dialog" title="撤单确认" :teleported="false" :close-on-press-escape="false">
      <template v-if="cancelingOrder">
        <section class="order-cancel-summary" aria-label="待撤订单摘要">
          <header class="order-cancel-summary-head">
            <div><strong>{{ cancelingOrder.name }}({{ cancelingOrder.code }})</strong></div>
          </header>
          <div class="order-cancel-summary-metrics">
            <div><span>订单价格</span><b :class="{ 'is-market': cancelingOrder.price === null }">{{ cancelingOrder.price === null ? '市价' : money(cancelingOrder.price) }}</b><small v-if="cancelingOrder.price === null">以市场价格成交</small></div>
            <div><span>订单数量</span><b>{{ number(cancelableQuantity(cancelingOrder)) }}</b></div>
          </div>
        </section>
        <dl class="order-cancel-details" aria-label="订单信息">
          <div><dt>订单编号</dt><dd>{{ cancelingOrder.orderNo }}</dd></div>
          <div><dt>下单账户</dt><dd>{{ accountLabel(cancelingOrder.account) }}</dd></div>
          <div><dt>内部上手方账户</dt><dd :title="cancelingOrder.brokerAccountLabel || cancelingOrder.brokerAccountId || '--'">{{ cancelingOrder.brokerAccountLabel || cancelingOrder.brokerAccountId || '--' }}</dd></div>
          <div><dt>开平方向</dt><dd>{{ cancelingOrder.openClose === '开' ? '开仓' : '平仓' }}</dd></div>
          <div><dt>买卖方向</dt><dd :class="cancelingOrder.side === 'buy' ? 'up' : 'down'">{{ cancelingOrder.side === 'buy' ? '买入' : '卖出' }}</dd></div>
          <div><dt>订单方式</dt><dd>{{ cancelingOrder.type === 'market' ? '市价单' : '限价单' }}</dd></div>
        </dl>
      </template>
      <template #footer><el-button @click="cancelOrderVisible=false">取消[Esc]</el-button><el-button type="primary" @click="confirmCancelOrder">确认撤单[Enter]</el-button></template>
    </BaseDialog>
</template>

<style>
.variants-app .order-cancel-dialog .order-cancel-details>div{grid-template-columns:112px minmax(0,1fr)}
.variants-app .positions-tabs>button{touch-action:none;user-select:none}
.variants-app .positions-tabs.is-restore-target{position:relative;box-shadow:inset 0 0 0 1px #bb984a}
.variants-app .tab-restore-cue{position:absolute;top:50%;left:12px;z-index:1;transform:translateY(-50%);padding:4px 8px;border-radius:2px;background:#302c24;color:#e1c36f;pointer-events:none}
.variants-app .detached-empty{flex:1;display:grid;place-items:center;color:#818995;font-size:12px}
.variants-app .detached-tab-window{grid-area:auto;position:absolute;border-color:#786846;box-shadow:0 14px 42px #000a}
.variants-app .detached-tab-window.is-maximized{position:fixed;border-radius:0}
.variants-app .detached-tab-header{height:36px;flex:0 0 36px;display:flex;align-items:center;gap:10px;padding:0 10px;border-bottom:1px solid #303338;background:#25282d;cursor:grab;touch-action:none;user-select:none}
.variants-app .detached-tab-header:active{cursor:grabbing}
.variants-app .detached-tab-header strong{font-size:12px;font-weight:600}
.variants-app .detached-tab-count{margin-left:3px;color:#bb984a}
.variants-app .detached-account-filter{width:148px;min-width:86px;flex:0 1 148px;margin-left:auto}
.variants-app .detached-window-actions{display:flex;align-self:stretch;align-items:center;margin-right:-10px}
.variants-app .detached-window-actions button{display:grid;place-items:center;width:34px;height:100%;padding:0;border:0;background:transparent;color:#c7cdd6;cursor:pointer}
.variants-app .detached-window-actions button:hover{background:#3a3e45}
.variants-app .detached-window-actions .detached-window-close:hover{background:#8b424d;color:#fff}
.variants-app .detached-window-actions svg{width:14px;height:14px;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
.variants-app .detached-window-actions .el-icon{font-size:15px}
.variants-app .detached-tab-resize{position:absolute;right:0;bottom:0;z-index:2;width:17px;height:17px;padding:0;border:0;background:linear-gradient(135deg,transparent 62%,#8f7947 63%,#8f7947 69%,transparent 70%);cursor:nwse-resize;touch-action:none}
.variants-app .tab-drag-preview{position:fixed;z-index:79;padding:6px 10px;border:1px solid #bb984a;border-radius:3px;background:#302c24;color:#e1c36f;box-shadow:0 8px 24px #0008;pointer-events:none;white-space:nowrap}
</style>
