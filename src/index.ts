import { TransactionResponse } from '@ethersproject/abstract-provider'
import { getEverpayBalance, getEverpayInfo } from './api'
import { getEverpayHost } from './config/urls'
import { fromDecimalToUnit, fromUnitToDecimal, getTokenBySymbol } from './utils/util'
import { EverpayBase, BalanceParams, DepositParams } from './interface'

class Everpay extends EverpayBase {
  constructor (config: Config) {
    super()
    this._config = config
    this._apiHost = getEverpayHost(config.debug)
    // this.cachedTimestamp = 0
  }

  private readonly _apiHost: string
  private readonly _config: Config
  private _cachedInfo?: EverpayInfo
  // cachedTimestamp: number

  async info (): Promise<EverpayInfo> {
    if (this._cachedInfo === undefined) {
      this._cachedInfo = await getEverpayInfo(this._apiHost)
    }
    return this._cachedInfo
  }

  async balance (params?: BalanceParams): Promise<number> {
    if (this._cachedInfo === undefined) {
      await this.info()
    }
    params = params ?? {}
    const { symbol, account } = params
    const token = getTokenBySymbol(symbol ?? 'eth', this._cachedInfo?.tokenList)
    const mergedParams = {
      chainType: params.chainType ?? token.chainType,
      symbol: params.symbol ?? token.symbol,
      contractAddress: token.id,
      account: account ?? this._config.account
    }
    const everpayBalance = await getEverpayBalance(this._apiHost, mergedParams)
    return fromDecimalToUnit(everpayBalance.balance, token.decimals).toNumber()
  }

  async deposit (params: DepositParams): Promise<TransactionResponse> {
    const { amount } = params
    const eth = this._cachedInfo?.tokenList.find(t => t.symbol === 'ETH')
    const value = fromUnitToDecimal(amount, eth?.decimals ?? 18, 10)
    const transactionRequest = {
      from: this._config.account,
      to: this._cachedInfo?.ethLocker,
      value
    }
    return this._config.connectedSigner.sendTransaction(transactionRequest)
  }
}

export default Everpay
