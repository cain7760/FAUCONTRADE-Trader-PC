import test from 'node:test'
import assert from 'node:assert/strict'
import { instructionStatusLabel, instructionStatuses } from './instructionStatus.js'

test('指令状态字典按编码显示，且不包含未编码状态', () => {
  assert.equal(instructionStatuses.length, 14)
  for (const [code, label] of instructionStatuses) {
    assert.equal(instructionStatusLabel({ instructionStatusCode: code }), label)
  }
  assert.equal(instructionStatusLabel({ instructionStatusCode: 9 }), '废单')
  assert.equal(instructionStatuses.some(([, label]) => label === '新单待审核'), false)
})

test('指令表兼容旧演示状态，但优先使用正式指令状态编码', () => {
  assert.equal(instructionStatusLabel({ status: '完成' }), '全成')
  assert.equal(instructionStatusLabel({ status: '异常' }), '废单')
  assert.equal(instructionStatusLabel({ status: '已报', instructionStatusCode: '4' }), '待撤[部成]')
  assert.equal(instructionStatusLabel({ status: '未知状态' }), '--')
})
