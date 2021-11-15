import { getEverpayTxMessage, signMessageAsync, transferAsync } from './lib/sign'
import { getSwapInfo, getEverpayBalance, getEverpayBalances, getEverpayInfo, getEverpayTransaction, getEverpayTransactions, getExpressInfo, getMintdEverpayTransactionByChainTxHash, postTx, getSwapPrice, placeSwapOrder, getFees, getFee } from './api'
import { everpayTxVersion, getExpressHost, getEverpayHost, getSwapHost } from './config'
import { getTimestamp, getTokenBySymbol, toBN, getAccountChainType, fromDecimalToUnit, genTokenTag, matchTokenTag, genExpressData, fromUnitToDecimalBN, genBundleData, getTokenBurnFeeByChainType } from './utils/util'
import { GetEverpayBalanceParams, GetEverpayBalancesParams, GetEverpayTransactionsParams } from './types/api'
import { checkParams } from './utils/check'
import { ERRORS } from './utils/errors'
import { utils } from 'ethers'
import {
  Config, EverpayInfo, EverpayBase, BalanceParams, BalancesParams, DepositParams, SwapInfo,
  SendEverpayTxResult, TransferParams, WithdrawParams, EverpayTxWithoutSig, EverpayAction, BundleData,
  SwapOrder, SwapPriceParams, SwapPriceResult, FeeItem,
  BalanceItem, TxsParams, TxsByAccountParams, TxsResult, EverpayTransaction, Token, EthereumTransaction, ArweaveTransaction, ExpressInfo, CachedInfo, InternalTransferItem, BundleDataWithSigs, BundleParams
} from './types'
import { swapParamsClientToServer, swapParamsServerToClient } from './utils/swap'

export * from './types'
class Everpay extends EverpayBase {
  constructor (config?: Config) {
    super()
    this._config = {
      ...config,
      account: config?.account ?? ''
    }
    this._apiHost = getEverpayHost(config?.debug)
    this._expressHost = getExpressHost(config?.debug)
    this._swapHost = getSwapHost(config?.debug)
    this._cachedInfo = {}
  }

  private readonly _apiHost: string
  private readonly _expressHost: string
  private readonly _swapHost: string
  private readonly _config: Config
  private _cachedInfo: CachedInfo

  getAccountChainType = getAccountChainType

  private readonly cacheHelper = async (key: 'everpay' | 'express' | 'swap'): Promise<EverpayInfo | ExpressInfo | SwapInfo> => {
    const timestamp = getTimestamp()
    // cache info 3 mins
    if (this._cachedInfo[key]?.value != null &&
      (this._cachedInfo[key] as any).timestamp > timestamp - 3 * 60) {
      return this._cachedInfo[key]?.value as EverpayInfo | ExpressInfo | SwapInfo
    }

    if (key === 'everpay') {
      const value = await await getEverpayInfo(this._apiHost)
      this._cachedInfo[key] = { value, timestamp }
    } else if (key === 'express') {
      const value = await await getExpressInfo(this._expressHost)
      this._cachedInfo[key] = { value, timestamp }
    } else if (key === 'swap') {
      const value = await await getSwapInfo(this._swapHost)
      this._cachedInfo[key] = { value, timestamp }
    }
    return this._cachedInfo[key]?.value as EverpayInfo | ExpressInfo | SwapInfo
  }

  async info (): Promise<EverpayInfo> {
    const result = await this.cacheHelper('everpay')
    return result as EverpayInfo
  }

  async expressInfo (): Promise<ExpressInfo> {
    const result = await this.cacheHelper('express')
    return result as ExpressInfo
  }

  async swapInfo (): Promise<SwapInfo> {
    const result = await this.cacheHelper('swap')
    return result as SwapInfo
  }

  async balance (params: BalanceParams): Promise<string> {
    await this.info()
    const { symbol, account } = params
    const acc = account ?? this._config.account as string
    const token = getTokenBySymbol(symbol, this._cachedInfo?.everpay?.value.tokenList)
    checkParams({ account: acc, symbol, token })
    const mergedParams: GetEverpayBalanceParams = {
      tokenTag: genTokenTag(token as Token),
      account: acc
    }
    const everpayBalance = await getEverpayBalance(this._apiHost, mergedParams)
    return fromDecimalToUnit(everpayBalance.balance.amount, everpayBalance.balance.decimals)
  }

  async balances (params?: BalancesParams): Promise<BalanceItem[]> {
    await this.info()
    params = (params ?? {}) as BalanceParams
    const { account } = params
    const acc = account ?? this._config.account as string
    checkParams({ account: acc })
    const mergedParams: GetEverpayBalancesParams = {
      account: acc
    }
    const everpayBalances = await getEverpayBalances(this._apiHost, mergedParams)
    const balances = everpayBalances.balances.map(item => {
      const tag = item.tag
      const [chainType, symbol, address] = tag.split('-')
      return {
        chainType,
        symbol: symbol.toUpperCase(),
        address,
        balance: fromDecimalToUnit(item.amount, item.decimals)
      }
    })
    return balances
  }

  private async getMergedTxsParams (params: TxsParams): Promise<GetEverpayTransactionsParams> {
    const { page, symbol, action } = params
    const mergedParams: GetEverpayTransactionsParams = {}
    if (page !== undefined) {
      mergedParams.page = page
    }
    if (symbol !== undefined) {
      await this.info()
      const token = getTokenBySymbol(symbol, this._cachedInfo?.everpay?.value.tokenList) as Token
      checkParams({ token })
      mergedParams.tokenId = token.id
    }
    if (action !== undefined) {
      checkParams({ action })
      mergedParams.action = action
    }
    return mergedParams
  }

  async txs (params: TxsParams): Promise<TxsResult> {
    const mergedParams: GetEverpayTransactionsParams = await this.getMergedTxsParams(params)
    return await getEverpayTransactions(this._apiHost, mergedParams)
  }

  async txsByAccount (params: TxsByAccountParams): Promise<TxsResult> {
    checkParams({ account: params.account ?? this._config.account })
    const mergedParams: GetEverpayTransactionsParams = await this.getMergedTxsParams(params)
    mergedParams.account = params.account ?? this._config.account
    return await getEverpayTransactions(this._apiHost, mergedParams)
  }

  async txByHash (everHash: string): Promise<EverpayTransaction> {
    checkParams({ everHash })
    return await getEverpayTransaction(this._apiHost, everHash)
  }

  async mintedTxByChainTxHash (chainTxHash: string): Promise<EverpayTransaction> {
    checkParams({ chainTxHash })
    return await getMintdEverpayTransactionByChainTxHash(this._apiHost, chainTxHash)
  }

  async fees (): Promise<FeeItem[]> {
    return await getFees(this._apiHost)
  }

  async fee (symbol: string): Promise<FeeItem> {
    await this.info()
    const token = getTokenBySymbol(symbol, this._cachedInfo?.everpay?.value.tokenList) as Token
    checkParams({ symbol, token })
    return await getFee(this._apiHost, genTokenTag(token))
  }

  async deposit (params: DepositParams): Promise<EthereumTransaction | ArweaveTransaction> {
    await this.info()
    const { amount, symbol } = params
    const token = getTokenBySymbol(symbol, this._cachedInfo?.everpay?.value.tokenList) as Token
    const value = utils.parseUnits(toBN(amount).toString(), token?.decimals)
    const from = this._config.account
    checkParams({ account: from, symbol, token, amount })

    return await transferAsync(this._config, this._cachedInfo.everpay?.value as EverpayInfo, {
      symbol,
      token,
      from: from ?? '',
      value
    })
  }

  async getEverpayTxWithoutSig (
    type: 'transfer' | 'withdraw' | 'bundle',
    params: TransferParams | WithdrawParams | BundleParams
  ): Promise<EverpayTxWithoutSig> {
    await this.info()
    const { symbol, amount, fee, quickMode } = params as WithdrawParams
    const token = getTokenBySymbol(symbol, this._cachedInfo?.everpay?.value.tokenList)
    const from = this._config.account as string
    let data = params.data
    let to = params?.to as string
    let decimalFeeBN = toBN(0)
    let decimalOperateAmountBN = toBN(0)
    let action = EverpayAction.transfer

    checkParams({ account: from, symbol, token, to })

    if (type === 'transfer') {
      checkParams({ amount })
      action = EverpayAction.transfer
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)
    } else if (type === 'bundle') {
      action = EverpayAction.bundle
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    } else if (type === 'withdraw') {
      checkParams({ amount })
      const chainType = (params as WithdrawParams).chainType
      const tokenChainType = token?.chainType as string

      // 快速提现
      if (quickMode === true) {
        action = EverpayAction.transfer
        const expressInfo = await this.expressInfo()
        const tokenTag = genTokenTag(token as Token)
        const foundExpressTokenData = expressInfo.tokens.find(t => matchTokenTag(tokenTag, t.tokenTag))
        if (foundExpressTokenData == null) {
          throw new Error(ERRORS.WITHDRAW_TOKEN_NOT_SUPPORT_QUICK_MODE)
        }

        const quickWithdrawLimitBN = fromUnitToDecimalBN(foundExpressTokenData.walletBalance, token?.decimals ?? 0)

        // 快速提现的手续费，只放入 data 字段中
        const quickWithdrawFeeBN = fee !== undefined
          ? fromUnitToDecimalBN(fee, token?.decimals ?? 0)
          : toBN(foundExpressTokenData.withdrawFee)

        // 快速提现的 amount 为全部数量
        decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

        if (decimalOperateAmountBN.lte(quickWithdrawFeeBN)) {
          throw new Error(ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE)
        }

        if (decimalOperateAmountBN.gt(quickWithdrawLimitBN)) {
          throw new Error(ERRORS.INSUFFICIENT_QUICK_WITHDRAWAL_AMOUNT)
        }

        const expressData = genExpressData({
          chainType, to, fee: quickWithdrawFeeBN.toString()
        })
        data = data !== undefined ? { ...data, ...expressData } : { ...expressData }

        // to 需要更改为快速提现收款账户
        to = expressInfo.address

        // 普通提现
      } else {
        action = EverpayAction.withdraw

        if (fee !== undefined) {
          decimalFeeBN = fromUnitToDecimalBN(fee, token?.decimals ?? 0)
        } else {
          const feeItem = await getFee(this._apiHost, genTokenTag(token as Token))
          decimalFeeBN = toBN(getTokenBurnFeeByChainType(token as Token, feeItem, chainType) ?? '0')
        }

        // 普通提现只有在可跨链提现的资产时，才需要 targetChainType
        if (tokenChainType !== chainType && tokenChainType.includes(chainType)) {
          const targetChainType = chainType
          data = data !== undefined ? { ...data, targetChainType } : { targetChainType }
        }
        decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0).minus(decimalFeeBN)
        // 普通提现的 amount 为实际到账数量
        if (decimalOperateAmountBN.lte(0)) {
          throw new Error(ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE)
        }
      }
    }

    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: symbol,
      action,
      from,
      to,
      amount: decimalOperateAmountBN.toString(),
      fee: decimalFeeBN.toString(),
      feeRecipient: this._cachedInfo?.everpay?.value.feeRecipient ?? '',
      nonce: Date.now().toString(),
      tokenID: token?.id as string,
      chainType: token?.chainType as string,
      chainID: token?.chainID as string,
      data: data !== undefined ? JSON.stringify(data) : '',
      version: everpayTxVersion
    }
    return everpayTxWithoutSig
  }

  getEverpayTxMessage (everpayTxWithoutSig: EverpayTxWithoutSig): string {
    return getEverpayTxMessage(everpayTxWithoutSig)
  }

  async sendEverpayTx (everpayTxWithoutSig: EverpayTxWithoutSig): Promise<SendEverpayTxResult> {
    const messageData = getEverpayTxMessage(everpayTxWithoutSig)
    const { everHash, sig } = await signMessageAsync(this._config, messageData)
    const everpayTx = {
      ...everpayTxWithoutSig,
      sig
    }
    const postEverpayTxResult = await postTx(this._apiHost, everpayTx)
    return {
      ...postEverpayTxResult,
      everpayTx,
      everHash
    }
  }

  async transfer (params: TransferParams): Promise<SendEverpayTxResult> {
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('transfer', params)
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async withdraw (params: WithdrawParams): Promise<SendEverpayTxResult> {
    await this.info()
    const to = params.to ?? this._config.account as string
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('withdraw', {
      ...params,
      to
    })
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async getBundleData (items: InternalTransferItem[], expiration?: number): Promise<BundleData> {
    await this.info()
    return genBundleData({
      items,
      tokenList: this._cachedInfo.everpay?.value?.tokenList as Token[],
      // 设置 60s 过期
      expiration: expiration ?? Math.round(Date.now() / 1000) + 60
    })
  }

  async signBundleData (bundleData: BundleData | BundleDataWithSigs): Promise<BundleDataWithSigs> {
    const { items, expiration, salt, version } = bundleData
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      // 只签名这几个字段，并且顺序需要保持一致
      items, expiration, salt, version
    }))
    const sigs = (bundleData as BundleDataWithSigs).sigs != null ? (bundleData as BundleDataWithSigs).sigs : {}
    sigs[this._config.account as string] = sig
    return {
      items, expiration, salt, version, sigs
    }
  }

  async bundle (params: BundleParams): Promise<SendEverpayTxResult> {
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('bundle', params)
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async swapPrice (params: SwapPriceParams): Promise<SwapPriceResult> {
    await Promise.all([this.info(), this.swapInfo()])
    const everpayInfo = this._cachedInfo.everpay?.value as EverpayInfo
    const swapInfo = this._cachedInfo.swap?.value as SwapInfo
    const paramsToServer = swapParamsClientToServer(
      params,
      everpayInfo,
      swapInfo
    )
    const result = await getSwapPrice(this._swapHost, paramsToServer)
    const formated = swapParamsServerToClient(result, everpayInfo, swapInfo) as SwapOrder
    return {
      ...formated,
      indicativePrice: result.indicativePrice,
      spreadPercent: result.spreadPercent
    }
  }

  async getSwapBundleData (params: SwapOrder): Promise<BundleData> {
    await Promise.all([this.info(), this.swapInfo()])
    const swapInfo = this._cachedInfo.swap?.value as SwapInfo
    const { tokenIn, tokenOut, tokenInAmount, tokenOutAmount } = params
    return await this.getBundleData([
      {
        from: this._config.account as string,
        to: swapInfo.address,
        symbol: tokenIn,
        amount: tokenInAmount
      },
      {
        from: swapInfo.address,
        to: this._config.account as string,
        symbol: tokenOut,
        amount: tokenOutAmount
      }
    ])
  }

  async swapOrder (bundleData: BundleData): Promise<string> {
    const { items, expiration, salt, version } = bundleData
    const { sig } = await signMessageAsync(this._config, JSON.stringify(bundleData))
    return await placeSwapOrder(this._swapHost, {
      items,
      expiration,
      salt,
      version,
      sigs: {
        [this._config.account as string]: sig
      }
    })
  }
}

export default Everpay
