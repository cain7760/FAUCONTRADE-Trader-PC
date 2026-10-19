export const instructionStatuses = Object.freeze([
  ['0', '未报'], ['1', '待报'], ['2', '已报'], ['3', '待撤'],
  ['4', '待撤[部成]'], ['5', '部撤'], ['6', '撤单'], ['7', '部成'],
  ['8', '全成'], ['9', '废单'], ['A', '待改'], ['E', '待改[部成]'],
  ['N', '改单待审核'], ['C', '撤单待审核'],
])

const labelsByCode = new Map(instructionStatuses)
const labels = new Set(instructionStatuses.map(([, label]) => label))
// 仅兼容当前演示订单的旧状态；真实指令优先使用 instructionStatusCode。
const legacyLabels = new Map([
  ['已撤', '撤单'], ['完成', '全成'], ['异常', '废单'], ['拒绝', '废单'],
  ['改单中', '待改'], ['暂停', '待撤'], ['其他', '未报'],
])

export function instructionStatusLabel(row) {
  const value = row.instructionStatusCode ?? row.instructionStatus ?? row.status
  return labelsByCode.get(String(value)) || (labels.has(value) ? value : legacyLabels.get(value)) || '--'
}
