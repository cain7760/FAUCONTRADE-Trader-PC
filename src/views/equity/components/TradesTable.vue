<script setup>
import { inject } from 'vue'
import { money, price as formatPrice } from '../variantData'
import { tradingContextKey, chaseActionsVisible } from '../tradingContext'
import { currencyFor, orderActivity, orderActivityHint, sharesWithUnit } from '../tradingPresentation'
import SharedRecords from '../../../components/trading/TradeRecords.vue'
const props = defineProps({ accountIds: { type: Array, default: null } })
const context = { ...inject(tradingContextKey), money, formatPrice, chaseActionsVisible, currencyFor, orderActivity, orderActivityHint, sharesWithUnit }
</script>

<template><SharedRecords :context="context" :account-ids="props.accountIds" /></template>
