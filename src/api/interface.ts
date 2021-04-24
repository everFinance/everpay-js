import { ChainType } from '../global'

export interface GetEverpayBalanceParams {
  chainType: ChainType
  id: string
  symbol: string
  account: string
}

export interface GetEverpayBalanceResult {
  accid: string
  balance: string
}

export interface PostEverpayTxResult {
  // TODO: ok or other status
  status: string
}
