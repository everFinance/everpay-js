export interface GetEverpayTransactionsParams {
  account?: string
  tokenId?: string
  action?: string
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
export interface SwapPriceParams {
  tokenIn: string
  tokenOut: string
  tokenInAmount?: string
  tokenOutAmount?: string
}

export interface SwapOrder {
  tokenIn: string
  tokenOut: string
  tokenInAmount: string
  tokenOutAmount: string
}

export interface SwapPriceResult extends SwapOrder {
  spreadPercent: string
  indicativePrice: string
}
