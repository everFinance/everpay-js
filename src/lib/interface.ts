import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '../global'

export interface TransferAsyncParams {
  symbol: string
  token: Token
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
