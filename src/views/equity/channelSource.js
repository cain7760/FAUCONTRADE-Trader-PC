export const channelSources = Object.freeze({
  customer: 'customer客户端',
  trader: 'trader客户端',
  fixin: 'fixin',
})

const labels = new Map([
  ...Object.values(channelSources).map(value => [value, value]),
  ['Customer客户端', channelSources.customer],
  ['Trader客户端', channelSources.trader],
])

export const channelSourceLabel = value => labels.get(value) || '--'
