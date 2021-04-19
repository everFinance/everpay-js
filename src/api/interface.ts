import { ChainType, EverpayTx } from '../global'

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

export interface PostEverpayTxParams extends EverpayTx {
  chainID: string
}

export interface PostEverpayTxResult {
  // TODO: ok or other status
  status: string
}
