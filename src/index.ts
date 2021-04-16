import { getEverpayBalance, getEverpayInfo } from './api'
import { getEverpayHost } from './config/urls'
import { fromDecimalToUnit, getTokenBySymbol } from './utils/util'
import { EverpayBase, BalanceParams } from './interface'

class Everpay extends EverpayBase {
  constructor (config: Config) {
    super()
    this._config = config
    this._apiHost = getEverpayHost(config.debug)
    // this.cachedTimestamp = 0
  }

  private readonly _apiHost: string
  private readonly _config: Config
  private readonly _cachedInfo?: EverpayInfo
  // cachedTimestamp: number

  async info (): Promise<EverpayInfo> {
    if (this._cachedInfo === undefined) {
      return await getEverpayInfo(this._apiHost)
    } else {
      return this._cachedInfo
    }
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
}

export default Everpay
