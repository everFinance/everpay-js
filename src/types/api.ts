export interface GetEverpayTransactionsParams {
  account?: string
  tokenTag?: string
  action?: string
  withoutAction?: string
  cursor?: number
  page?: number
}

export interface BalanceItemFromServer {
  tag: string
  amount: string
  decimals: number
}
export interface GetEverpayBalanceParams {
  account: string
  tokenTag: string
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
