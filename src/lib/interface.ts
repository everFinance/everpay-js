import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '../types'

export interface TransferAsyncParams {
  symbol: string
  token: Token
  from: string
  to?: string
  value: BigNumber
}

export interface SignMessageAsyncResult {
  sig: string
  everHash: string
}
