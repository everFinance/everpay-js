import { BigNumber } from 'ethers'

export interface TransferAsyncParams {
  symbol: string
  tokenID: string
  from: string
  to?: string
  value: BigNumber
}

export interface ArTransferResult {
  status: number
  statusText: string
  data: any
}
