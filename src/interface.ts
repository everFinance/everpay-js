export interface BalanceParams {
  chainType?: ChainType
  symbol?: string
  account?: string
}

export abstract class EverpayBase {
  abstract info (): Promise<EverpayInfo>
  abstract balance (params?: BalanceParams): Promise<number>
}
