<script setup>
import { withoutShareUnit } from '../../../utils/tableQuantity.js'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { chaseActionsVisible, tradingContextKey } from '../tradingContext'
import { ArrowDownBold, Search, InfoFilled, Refresh } from '@element-plus/icons-vue'
import { money, signedMoney, price as formatPrice } from '../variantData'
import { currencyFor, sharesWithUnit } from '../tradingPresentation'
import SortHeader from '../../../components/trading/SortHeader.vue'
import TradingOperationColumn from '../../../components/trading/TradingOperationColumn.vue'
import TradingTable from '../../../components/trading/TradingTable.vue'
const props = defineProps({ accountIds: { type: Array, default: null } })
const { assetUrl, variant, systemRunning, query, positionType, positionAccount, positionAccountType, accountTypes, effectiveAccountIds, table, tableRefreshKey, sortState, positionColumnDefaults, visibleColumnKeys, columnOptions, account, allRows, filtered, sortedRows, positionRowsForAccounts, accountLabel, accountTypeLabel, applyFilters, clearFilters, confirmExport, refreshTable, toggleSort, loadPositionIntoTicket, openClosePosition, openChaseOrder } = inject(tradingContextKey)
const displayedRows = computed(() => props.accountIds ? positionRowsForAccounts(props.accountIds) : { allRows: allRows.value, filtered: filtered.value, sortedRows: sortedRows.value })
const filterAccountIds = computed(() => props.accountIds || effectiveAccountIds.value)
const filterBar = ref(null)
const visibleFilterCount = ref(3)
let filterObserver
function fitFilters() {
  const bar = filterBar.value
  if (!bar) return
  const style = getComputedStyle(bar)
  const gap = parseFloat(style.columnGap) || 0
  const available = bar.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  const optional = [...bar.querySelectorAll(':scope > .position-filter-optional')]
  const widths = optional.map(el => parseFloat(getComputedStyle(el).width))
  const searchWidth = parseFloat(getComputedStyle(bar.querySelector('.position-symbol-filter')).width)
  const fixed = [...bar.children].filter(el => el.matches('.filter-query, .el-button.is-link, .table-toolbar-actions'))
  const fixedWidth = fixed.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
  const moreWidth = parseFloat(getComputedStyle(bar.querySelector('.order-filter-more')).width)
  let count = widths.length
  while (count >= 0) {
    const hasMore = count < widths.length
    const hasSearch = count >= 0
    const optionalCount = Math.max(0, count)
    const total = fixedWidth + (hasSearch ? searchWidth : 0)
      + widths.slice(0, optionalCount).reduce((sum, width) => sum + width, 0)
      + (hasMore ? moreWidth : 0)
      + gap * (fixed.length + Number(hasSearch) + optionalCount + Number(hasMore) - 1)
    if (total <= available) break
    count--
  }
  visibleFilterCount.value = count
}
onMounted(() => {
  filterObserver = new ResizeObserver(fitFilters)
  filterObserver.observe(filterBar.value)
  fitFilters()
})
onBeforeUnmount(() => filterObserver?.disconnect())
</script>

<template>

          <div ref="filterBar" class="position-filters">
            <el-input v-show="visibleFilterCount >= 0" v-model="query" class="position-symbol-filter" :prefix-icon="Search" placeholder="代码 / 名称" aria-label="搜索持仓" clearable />
            <el-select v-show="visibleFilterCount > 0" v-model="positionType" class="position-filter-optional" aria-label="多空方向筛选" popper-class="variant-popper" :offset="2"><el-option label="全部方向" value="ALL"/><el-option label="多头" value="多"/><el-option label="空头" value="空"/></el-select>
            <el-select v-show="visibleFilterCount > 1" v-model="positionAccount" class="position-account-filter position-filter-optional" aria-label="持仓下单账户筛选" popper-class="variant-popper" :offset="2"><el-option label="全部下单账户" value="ALL"/><el-option v-for="id in filterAccountIds" :key="id" :label="accountLabel(id)" :value="id"/></el-select>
            <el-select v-show="visibleFilterCount > 2" v-model="positionAccountType" class="position-account-type-filter position-filter-optional" aria-label="持仓账户类型筛选" popper-class="variant-popper" :offset="2"><el-option label="全部账户类型" value="ALL"/><el-option v-for="type in accountTypes" :key="type" :label="type" :value="type"/></el-select>
            <el-popover trigger="click" placement="bottom-start" :width="260" popper-class="variant-popper order-filter-more-popper"><template #reference><el-button v-show="visibleFilterCount < 3" class="order-filter-more" aria-label="更多筛选条件">更多<el-icon><ArrowDownBold /></el-icon></el-button></template><div class="order-filter-more-panel"><label v-if="visibleFilterCount < 0">标的搜索<el-input v-model="query" :prefix-icon="Search" placeholder="代码 / 名称" clearable /></label><label v-if="visibleFilterCount <= 0">多空方向<el-select v-model="positionType" popper-class="variant-popper"><el-option label="全部方向" value="ALL"/><el-option label="多头" value="多"/><el-option label="空头" value="空"/></el-select></label><label v-if="visibleFilterCount <= 1">下单账户<el-select v-model="positionAccount" popper-class="variant-popper"><el-option label="全部下单账户" value="ALL"/><el-option v-for="id in filterAccountIds" :key="id" :label="accountLabel(id)" :value="id"/></el-select></label><label v-if="visibleFilterCount <= 2">账户类型<el-select v-model="positionAccountType" popper-class="variant-popper"><el-option label="全部账户类型" value="ALL"/><el-option v-for="type in accountTypes" :key="type" :label="type" :value="type"/></el-select></label></div></el-popover>
            <el-button class="filter-query" @click="applyFilters">查询</el-button><el-button link @click="clearFilters">重置</el-button><div class="table-toolbar-actions"><el-tooltip content="刷新当前表格" placement="top"><button class="refresh-table" aria-label="刷新持仓" @click="refreshTable"><el-icon><Refresh /></el-icon></button></el-tooltip><button class="export-positions" aria-label="导出持仓" title="导出当前持仓表格数据" @click="confirmExport('positions', [], props.accountIds)"><el-icon><svg class="export-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg></el-icon></button></div>
          </div>
          <TradingTable :key="`positions-${tableRefreshKey}`" ref="table" class="original-fields" :data="displayedRows.sortedRows" height="100%" :fit="false" row-key="id" empty-text="无匹配持仓，请调整或重置筛选" copyable-identifiers @row-dblclick="loadPositionIntoTicket">
            <el-table-column type="index" fixed="left" label="序号" width="44" align="center" header-align="center" class-name="order-index-column" label-class-name="order-index-column" />
            <template v-for="columnKey in visibleColumnKeys" :key="columnKey">
              <el-table-column v-if="columnKey === 'direction'" prop="direction" label="多空方向" width="66" align="center" header-align="center" class-name="direction-column" label-class-name="direction-column"><template #default="{row}"><span class="direction-chip" :class="row.direction === '多' ? 'long' : 'short'"><img :src="assetUrl(row.direction === '多' ? 'direction-long.svg' : 'direction-short.svg')" alt="">{{ row.direction === '多' ? '做多' : '做空' }}</span></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'code'" prop="code" fixed="left" width="80"><template #header><SortHeader label="证券代码" :direction="sortState.prop === 'code' ? sortState.direction : null" @sort="toggleSort('code')" /></template><template #default="{row}">{{ row.code }}.{{ row.market }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'name'" prop="name" fixed="left" width="76"><template #header><SortHeader label="证券名称" :direction="sortState.prop === 'name' ? sortState.direction : null" @sort="toggleSort('name')" /></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'price'" prop="price" width="126" align="right" header-align="right"><template #header><SortHeader label="持仓均价/最新价" numeric :direction="sortState.prop === 'price' ? sortState.direction : null" @sort="toggleSort('price')" /></template><template #default="{row}"><span class="dim">{{ formatPrice(row.cost, row.market) }}</span> / <span :class="row.change>=0?'up':'down'">{{ formatPrice(row.price, row.market) }}</span></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'opening'" prop="opening" width="88" align="right" header-align="right"><template #header><SortHeader label="期初数量" numeric :direction="sortState.prop === 'opening' ? sortState.direction : null" @sort="toggleSort('opening')" /></template><template #default="{row}">{{ withoutShareUnit(sharesWithUnit(row.opening)) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'holdingQty'" prop="qty" width="112" align="right" header-align="right"><template #header><SortHeader label="持仓数量" numeric :direction="sortState.prop === 'qty' ? sortState.direction : null" @sort="toggleSort('qty')" /></template><template #default="{row}">{{ withoutShareUnit(sharesWithUnit(row.qty)) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'available'" prop="available" width="88" align="right" header-align="right"><template #header><SortHeader label="可用数量" numeric :direction="sortState.prop === 'available' ? sortState.direction : null" @sort="toggleSort('available')" /></template><template #default="{row}">{{ withoutShareUnit(sharesWithUnit(row.available)) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'valueWan'" prop="value" width="112" align="right" header-align="right"><template #header><SortHeader label="市值" numeric :direction="sortState.prop === 'value' ? sortState.direction : null" @sort="toggleSort('value')" /></template><template #default="{row}">{{ money(row.value) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'marginOccupied'" prop="marginOccupied" width="104" align="right" header-align="right"><template #header><SortHeader label="占用保证金" numeric :direction="sortState.prop === 'marginOccupied' ? sortState.direction : null" @sort="toggleSort('marginOccupied')" /></template><template #default="{row}">{{ money(row.marginOccupied) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'marginRate'" prop="marginRate" width="76" align="right" header-align="right"><template #header><SortHeader label="保证金率" numeric :direction="sortState.prop === 'marginRate' ? sortState.direction : null" @sort="toggleSort('marginRate')" /></template><template #default="{row}">{{ row.marginRate.toFixed(2) }}%</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'totalProfit'" prop="totalProfit" width="112" align="right" header-align="right"><template #header><span class="profit-heading"><SortHeader label="总盈亏" numeric :direction="sortState.prop === 'totalProfit' ? sortState.direction : null" @sort="toggleSort('totalProfit')" /><el-tooltip content="总盈亏 = 实现盈亏 + 浮动盈亏" placement="top" popper-class="order-help-popper"><button type="button" class="total-help" aria-label="总盈亏说明"><el-icon><InfoFilled /></el-icon></button></el-tooltip></span></template><template #default="{row}"><span :class="row.totalProfit >= 0 ? 'up' : 'down'">{{ signedMoney(row.totalProfit) }}</span></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'dailyRealizedProfit'" prop="dailyRealizedProfit" width="112" align="right" header-align="right"><template #header><SortHeader label="实现盈亏" numeric :direction="sortState.prop === 'dailyRealizedProfit' ? sortState.direction : null" @sort="toggleSort('dailyRealizedProfit')" /></template><template #default="{row}"><span :class="row.dailyRealizedProfit >= 0 ? 'up' : 'down'">{{ signedMoney(row.dailyRealizedProfit) }}</span></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'floatingProfit'" prop="floatingProfit" width="112" align="right" header-align="right"><template #header><SortHeader label="浮动盈亏" numeric :direction="sortState.prop === 'floatingProfit' ? sortState.direction : null" @sort="toggleSort('floatingProfit')" /></template><template #default="{row}"><span :class="row.floatingProfit >= 0 ? 'up' : 'down'">{{ signedMoney(row.floatingProfit) }}</span></template></el-table-column>
              <el-table-column v-else-if="columnKey === 'currency'" prop="currency" label="币种" width="56"><template #default="{row}">{{ currencyFor(row) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'account'" prop="account" label="下单账户" width="132"><template #default="{row}">{{ accountLabel(row.account) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'accountType'" label="账户类型" width="98"><template #default="{row}">{{ accountTypeLabel(row.account) }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'market'" prop="market" label="市场" width="48"><template #default="{row}">{{ row.market === 'HK' ? '港股' : row.market === 'SZ' ? '深市' : '沪市' }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'orderRemark'" prop="orderRemark" label="下单备注" width="128" show-overflow-tooltip><template #default="{row}">{{ row.orderRemark || '--' }}</template></el-table-column>
              <el-table-column v-else-if="columnKey === 'traderRemark'" prop="traderRemark" label="交易员备注" width="128" show-overflow-tooltip><template #default="{row}">{{ row.traderRemark || '--' }}</template></el-table-column>
            </template>
            <TradingOperationColumn v-model="visibleColumnKeys" :options="columnOptions" :defaults="positionColumnDefaults"><template #default="{ row }"><div v-if="row.direction === '多'" class="row-actions"><el-tooltip v-if="chaseActionsVisible" content="追加订单" placement="top" :show-after="300" popper-class="variant-popper order-action-popper"><span class="operation-tooltip"><button type="button" class="position-chase-action" aria-label="追加订单" :disabled="!systemRunning" @click.stop="openChaseOrder(row)">追</button></span></el-tooltip><el-tooltip content="平仓" placement="top" :show-after="300" popper-class="variant-popper order-action-popper"><span class="operation-tooltip"><button type="button" class="position-close-action" aria-label="平仓" :disabled="!systemRunning" @click.stop="openClosePosition(row)">平</button></span></el-tooltip></div></template></TradingOperationColumn>
          </TradingTable><footer class="positions-footer"><span>显示 {{ displayedRows.filtered.length }} / {{ displayedRows.allRows.length }} 条</span></footer>
</template>

<style scoped>
.position-filters { flex-wrap: nowrap; overflow: hidden; }
.position-filters > * { flex: 0 0 auto; }
.position-filters > .position-symbol-filter { min-width: 90px; }
.position-filters > .position-account-filter { width: 150px; min-width: 120px; }
.position-filters > .position-account-type-filter { width: 132px; min-width: 116px; }
@media (max-width: 1250px) { .position-filters > .position-symbol-filter { width: 100px; min-width: 90px; } }
</style>
