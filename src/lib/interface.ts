import { BigNumberish } from 'ethers'

export interface TransferAsyncParams {
  symbol: string
  tokenID: string
  from: string
  to?: string
  value: BigNumberish
}

export interface ArTransferResult {
  status: number
  statusText: string
  data: any
}
