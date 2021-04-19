import { TransactionResponse } from '@ethersproject/abstract-provider'
export interface BalanceParams {
  chainType?: ChainType
  symbol?: string
  account?: string
}

export interface DepositParams {
  chainType?: ChainType
  symbol?: string
  amount: number
}

export abstract class EverpayBase {
  abstract info (): Promise<EverpayInfo>
  abstract balance (params?: BalanceParams): Promise<number>
  abstract deposit (params: DepositParams): Promise<TransactionResponse>
  // withdraw
  // transfer
}
