import axios, { AxiosResponse } from 'axios'

import { getSafeClientGatewayBaseUrl } from 'src/config'
import { HistoryGatewayResponse, QueuedGatewayResponse } from 'src/logic/safe/store/models/types/gateway'
import { checksumAddress } from 'src/utils/checksumAddress'

const getHistoryTransactionsUrl = (safeAddress: string): string => {
  const address = checksumAddress(safeAddress)
  return `${getSafeClientGatewayBaseUrl(address)}/transactions/history/`
}

const historyPointers: { [safeAddress: string]: { next: string | null; previous: string | null } } = {}

export const loadPagedHistoryTransactions = async (
  safeAddress: string,
): Promise<{ values: HistoryGatewayResponse['results']; next: string | null } | undefined> => {
  // if `historyPointers[safeAddress] is `undefined` it means `loadHistoryTransactions` wasn't called
  // if `historyPointers[safeAddress].next is `null`, it means it reached the last page in gateway-client
  if (!historyPointers[safeAddress]?.next) {
    return
  }

  const {
    data: { results, ...pointers },
  } = await axios.get<HistoryGatewayResponse, AxiosResponse<HistoryGatewayResponse>>(
    historyPointers[safeAddress].next ?? '',
  )

  historyPointers[safeAddress] = pointers

  return { values: results, next: historyPointers[safeAddress].next }
}

export const loadHistoryTransactions = async (safeAddress: string): Promise<HistoryGatewayResponse['results']> => {
  const historyTransactionsUrl = getHistoryTransactionsUrl(safeAddress)
  const params = {
    page_url: 'limit=100',
  }

  const {
    data: { results, ...pointers },
  } = await axios.get<HistoryGatewayResponse, AxiosResponse<HistoryGatewayResponse>>(historyTransactionsUrl, { params })

  if (!historyPointers[safeAddress]) {
    historyPointers[safeAddress] = pointers
  }

  return results
}

const getQueuedTransactionsUrl = (safeAddress: string): string => {
  const address = checksumAddress(safeAddress)
  return `${getSafeClientGatewayBaseUrl(address)}/transactions/queued/`
}

const queuedPointers: { next: string | null; previous: string | null } = {
  next: null,
  previous: null,
}

export const loadQueuedTransactions = async (safeAddress: string): Promise<QueuedGatewayResponse['results']> => {
  const queuedTransactionsUrl = getQueuedTransactionsUrl(safeAddress)
  // requests the first 100 incoming txs
  const params = {
    page_url: 'limit=100',
  }
  const {
    data: { results, ...pointers },
  } = await axios.get<QueuedGatewayResponse, AxiosResponse<QueuedGatewayResponse>>(queuedTransactionsUrl, { params })

  queuedPointers.next = pointers.next
  queuedPointers.previous = pointers.previous

  return results
}
