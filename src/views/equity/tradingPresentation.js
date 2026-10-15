import { money, number } from './variantData'

export const sharesWithUnit = value => `${number(value)} 股`
export const moneyWithUnit = value => `${money(value)} CNY`
export const currencyFor = row => row.currency || (row.market === 'HK' ? 'HKD' : row.market === 'US' ? 'USD' : 'CNY')
export const orderActivityHint = '原为反馈信息（系统反馈的信息）；2026-10-13 起将系统反馈与交易员备注合并展示。'

export function orderValueWithUnit(row) {
  return row.inputAmount !== null && row.inputAmount !== undefined
    ? moneyWithUnit(row.orderValueNumber ?? row.inputAmount)
    : sharesWithUnit(row.quantity)
}

export function orderActivity(row) {
  const feedback = String(row?.feedback || '').trim()
  const traderRemark = String(row?.traderRemark || '').trim()
  return [feedback && `系统：${feedback}`, traderRemark && `交易员：${traderRemark}`].filter(Boolean).join('；') || '--'
}
