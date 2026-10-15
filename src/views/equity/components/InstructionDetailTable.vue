<script setup>
import TradingTable from './TradingTable.vue'

const numericColumns = new Set(['price', 'quantity', 'filledPrice', 'filledQuantity', 'filledAmount', 'canceledQuantity'])

const { rows, columns, emptyText, shown } = defineProps({
  rows: Array,
  columns: Array,
  emptyText: String,
  shown: Function,
})
</script>

<template>
  <TradingTable class="instruction-detail-table" :data="rows" height="100%" :fit="false" copyable-identifiers :empty-text="emptyText">
    <el-table-column v-for="[key, label, width] in columns" :key="key" :label="label" :width="width" :align="numericColumns.has(key) ? 'right' : 'left'" :header-align="numericColumns.has(key) ? 'right' : 'left'" show-overflow-tooltip>
      <template #default="{ row }">{{ shown(row, key) }}</template>
    </el-table-column>
  </TradingTable>
</template>
