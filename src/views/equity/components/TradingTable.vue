<script setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ExceptionState from '../../../components/ExceptionState.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({ copyableIdentifiers: Boolean })
const table = ref(null)
const isIdentifierColumn = column => column?.property === 'code' || /编号|代码/.test(column?.label || '')
const identifierCellClass = ({ column }) => props.copyableIdentifiers && isIdentifierColumn(column) ? 'copyable-identifier' : ''

async function writeIdentifier(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch { /* 浏览器拒绝剪贴板 API 时尝试传统复制方式。 */ }
  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  try { return document.execCommand('copy') } finally { input.remove() }
}

async function copyIdentifier(row, column, cell) {
  if (!props.copyableIdentifiers || !isIdentifierColumn(column)) return
  const value = cell.querySelector('.cell')?.textContent?.trim()
  if (!value || /^[-—–]+$/.test(value)) return
  try {
    if (!await writeIdentifier(value)) throw new Error('Clipboard unavailable')
    ElMessage.success({ message: `已复制${column.label || (column.property === 'code' ? '证券代码' : '编号')}：${value}`, duration: 1800, grouping: true })
  } catch {
    ElMessage.error('复制失败，请手动选择并复制')
  }
}
defineExpose({
  clearFilter: (...args) => table.value?.clearFilter?.(...args),
  clearSelection: () => table.value?.clearSelection?.(),
  doLayout: () => table.value?.doLayout?.(),
  setScrollTop: value => table.value?.setScrollTop?.(value),
})
</script>

<template>
  <el-table ref="table" class="trading-table" v-bind="$attrs" :cell-class-name="identifierCellClass" @cell-dblclick="copyIdentifier"><slot /><template #empty><slot name="empty"><ExceptionState type="empty" :description="$attrs['empty-text'] || '当前没有可显示的记录。'" compact :show-action="false" /></slot></template></el-table>
</template>

<style>
.trading-table.el-table{--el-table-bg-color:#1e2023;--el-table-tr-bg-color:#1e2023;--el-table-header-bg-color:#25282d;--el-table-row-hover-bg-color:#2c3036;--el-table-border-color:#2d3035;--el-table-text-color:#c9ced6;--el-table-header-text-color:#969eaa;font-size:12px}.trading-table.el-table th{height:35px;padding:4px 0;font-weight:400}.trading-table.el-table td{height:38px;padding:4px 0}.trading-table.el-table .cell{padding:0 8px;line-height:20px;white-space:nowrap}.trading-table.el-table .el-table__empty-text{color:#7f8793;font-size:12px}.trading-table.el-table .el-checkbox__inner{border-color:#66717d;background:#202328}.trading-table.el-table .el-checkbox__input.is-checked .el-checkbox__inner,.trading-table.el-table .el-checkbox__input.is-indeterminate .el-checkbox__inner{border-color:#bb984a;background:#bb984a}
.trading-table.el-table td.copyable-identifier .cell{cursor:copy}
</style>
