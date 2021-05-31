import { ChainType } from '../global'

export interface GetEverpayTransactionsParams {
  account?: string
  page: number
}

export interface BalanceItemFromServer {
  tag: string
  amount: string
  decimals: number
}
export interface GetEverpayBalanceParams {
  chainType: ChainType
  id: string
  symbol: string
  account: string
}

export interface GetEverpayBalanceResult {
  accid: string
  balance: BalanceItemFromServer
}
export interface GetEverpayBalancesParams {
  account: string
}

export interface GetEverpayBalancesResult {
  accid: string
  balances: BalanceItemFromServer[]
}
export interface PostEverpayTxResult {
  // TODO: ok or other status
  status: string
}
