import { ChainType } from '../global'
export interface GetEverpayBalanceParams {
  chainType: ChainType
  symbol: string
  contractAddress: string
  account: string
}

export interface GetEverpayBalanceResult {
  accid: string
  balance: string
}
