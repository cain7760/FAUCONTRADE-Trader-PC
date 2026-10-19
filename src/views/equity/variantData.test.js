import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePositionMetrics, variantRows } from './variantData.js'

test('持仓数量、可用数量、盈亏和保证金遵循 Customer 口径', () => {
  for (const row of variantRows) {
    const buys = (row.todayExecutions || []).filter(item => item.side === 'buy').reduce((total, item) => total + item.quantity, 0)
    const sells = (row.todayExecutions || []).filter(item => item.side === 'sell').reduce((total, item) => total + item.quantity, 0)
    assert.equal(row.qty, row.opening + buys - sells)
    assert.equal(row.available, row.qty - (row.pendingSell || 0) - buys)
    assert.equal(row.value, Math.round(row.price * 100) * row.qty / 100)
    assert.equal(row.marginOccupied, row.qty * Math.round(row.cost * 100) * row.marginRate / 10000)
    assert.equal(row.totalProfit, row.floatingProfit + row.dailyRealizedProfit)
  }
  assert.deepEqual(
    (({ opening, qty, available, dailyRealizedProfit }) => ({ opening, qty, available, dailyRealizedProfit }))(variantRows[1]),
    { opening: 11000, qty: 12500, available: 10000, dailyRealizedProfit: -360 },
  )
})

test('日内实现盈亏按先入先出逐批匹配', () => {
  const result = calculatePositionMetrics({
    openingLots: [{ quantity: 100, price: 10 }, { quantity: 100, price: 12 }],
    todayExecutions: [{ side: 'sell', quantity: 150, price: 15 }],
  })
  assert.deepEqual(result, { opening: 200, qty: 50, available: 50, dailyRealizedProfit: 650 })
})
