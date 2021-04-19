import { ChainType, EverpayAction } from '../global'

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

export interface PostEverpayTxParams {
  tokenSymbol: string
  action: EverpayAction
  from: string
  to: string
  amount: string
  fee: string
  feeRecipient: string
  nonce: string
  tokenID: string
  chainType: ChainType
  data: string
  version: string
  sig: string
}

export interface PostEverpayTxResult {
  // TODO: ok or other status
  status: string
}
