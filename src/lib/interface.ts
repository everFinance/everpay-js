export interface TransferAsyncParams {
  symbol: string
  tokenID: string
  from: string
  to?: string
  value: string
}

export interface ArTransferResult {
  status: number
  statusText: string
  data: any
}
