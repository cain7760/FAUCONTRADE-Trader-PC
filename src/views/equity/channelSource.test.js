import test from 'node:test'
import assert from 'node:assert/strict'
import { channelSourceLabel, channelSources } from './channelSource.js'

test('渠道来源仅使用指定的三个枚举值', () => {
  assert.deepEqual(Object.values(channelSources), ['customer客户端', 'trader客户端', 'fixin'])
  for (const value of Object.values(channelSources)) assert.equal(channelSourceLabel(value), value)
  assert.equal(channelSourceLabel('Customer客户端'), channelSources.customer)
  assert.equal(channelSourceLabel('Trader客户端'), channelSources.trader)
  assert.equal(channelSourceLabel('other'), '--')
})
