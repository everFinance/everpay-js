import { BigNumber } from '@ethersproject/bignumber'

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

export interface SignMessageAsyncResult {
  sig: string
  everHash: string
}
