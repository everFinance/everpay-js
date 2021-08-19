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

export interface DexInfo {
  status: string
  address: string
  tokenList: string[]
}

export interface DexPriceParams {
  tokenIn: string
  tokenOut: string
  tokenInAmount?: string
  tokenOutAmount?: string
}

export interface DexPriceResult {
  tokenIn: string
  tokenOut: string
  tokenInAmount: string
  tokenOutAmount: string
}

export interface PlaceOrderItem {
  amount: string
  chainID: string
  from: string
  to: string
  tag: string
}
export interface PlaceOrderParams {
  items: PlaceOrderItem[]
  expiration: number
  salt: string
  version: string
  sigs: {
    [account: string]: string
  }
}
