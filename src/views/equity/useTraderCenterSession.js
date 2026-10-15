import { computed, ref } from 'vue'
import { Briefcase, Clock, Collection, Connection, Document, List, Tickets } from '@element-plus/icons-vue'
import { marketInstruments } from './variantData'
import { recordPlacedTrsOrder } from './trsOrderStore'

const traderPrimaryMenu = [
  { key: 'swap', label: 'TRS', title: '收益互换', icon: Connection, children: [{ label: '订单管理', icon: Document }, { label: '我的HT订单', icon: Collection }] },
  { key: 'options', label: '期权', title: '期权交易', icon: List, children: [{ label: '期权交易', icon: Tickets }, { label: '持仓管理', icon: Briefcase }, { label: '生命周期', icon: Clock }] },
]

export function useTraderCenterSession({ selected, acceptOrder }) {
  const activeTraderPrimary = ref('swap')
  const activeTraderSecondary = ref('订单管理')
  const traderSecondaryCollapsed = ref(false)
  const activeTraderGroup = computed(() => traderPrimaryMenu.find(item => item.key === activeTraderPrimary.value) || traderPrimaryMenu[0])
  const trsOrderTicketVisible = ref(false)
  const trsOrderRequest = ref(null)
  const trsTicketSymbol = computed(() => trsOrderRequest.value?.symbol || selected.value)
  const trsTicketInstruments = computed(() => {
    const requestSymbol = trsOrderRequest.value?.symbol
    return requestSymbol && !marketInstruments.some(item => item.code === requestSymbol.code) ? [requestSymbol, ...marketInstruments] : marketInstruments
  })

  function selectTraderPrimary(key) {
    const group = traderPrimaryMenu.find(item => item.key === key)
    if (!group) return
    activeTraderPrimary.value = key
    activeTraderSecondary.value = group.children[0].label
  }
  function openTrsOrderTicket(request) {
    trsOrderRequest.value = request
    trsOrderTicketVisible.value = true
  }
  function acceptTrsOrder(order) {
    acceptOrder(order, { skipHtSync: true })
    recordPlacedTrsOrder({ sourceOrderId: trsOrderRequest.value?.sourceOrderId, order })
    trsOrderRequest.value = null
    trsOrderTicketVisible.value = false
  }

  return {
    traderPrimaryMenu, activeTraderPrimary, activeTraderSecondary, traderSecondaryCollapsed,
    activeTraderGroup, selectTraderPrimary, trsOrderTicketVisible, trsOrderRequest,
    trsTicketSymbol, trsTicketInstruments, openTrsOrderTicket, acceptTrsOrder,
  }
}
