import { getEverpayTxDataField, getEverpayTxMessage, signMessageAsync, transferAsync } from './lib/sign'
import { getEverpayBalance, getEverpayBalances, getEverpayInfo, getEverpayTransaction, getEverpayTransactions, getExpressInfo, getMintdEverpayTransactionByChainTxHash, postTx } from './api'
import { everpayTxVersion, getEverpayExpressHost, getEverpayHost } from './config'
import { getTimestamp, getTokenBySymbol, toBN, getAccountChainType, fromDecimalToUnit, genTokenTag, matchTokenTag, genExpressData, fromUnitToDecimalBN } from './utils/util'
import { GetEverpayBalanceParams, GetEverpayBalancesParams } from './types/api'
import { checkParams } from './utils/check'
import { ERRORS } from './utils/errors'
import { utils } from 'ethers'
import {
  ChainType, Config, EverpayInfo, EverpayBase, BalanceParams, BalancesParams, DepositParams,
  TransferOrWithdrawResult, TransferParams, WithdrawParams, EverpayTxWithoutSig, EverpayAction,
  BalanceItem, TxsParams, TxsByAccountParams, TxsResult, EverpayTransaction, Token, EthereumTransaction, ArweaveTransaction
} from './types'

export * from './types'
class Everpay extends EverpayBase {
  constructor (config?: Config) {
    super()
    this._config = {
      ...config,
      account: config?.account ?? ''
    }
    this._apiHost = getEverpayHost(config?.debug)
    this._cachedTimestamp = 0
  }

  private readonly _apiHost: string
  private readonly _config: Config
  private _cachedInfo?: EverpayInfo
  private _cachedTimestamp: number

  getAccountChainType = getAccountChainType

  async info (): Promise<EverpayInfo> {
    // cache info 3 mins
    if (this._cachedInfo === undefined || (getTimestamp() - 3 * 60 > this._cachedTimestamp)) {
      this._cachedInfo = await getEverpayInfo(this._apiHost)
      this._cachedTimestamp = getTimestamp()
    }
    return this._cachedInfo
  }

  async balance (params: BalanceParams): Promise<string> {
    await this.info()
    const { symbol, account } = params
    const acc = account ?? this._config.account as string
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    checkParams({ account: acc, symbol, token })
    const mergedParams: GetEverpayBalanceParams = {
      id: token?.id as string,
      chainType: token?.chainType as ChainType,
      symbol: params.symbol,
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

  async txs (params: TxsParams): Promise<TxsResult> {
    const { page } = params
    return await getEverpayTransactions(this._apiHost, { page })
  }

  async txsByAccount (params: TxsByAccountParams): Promise<TxsResult> {
    const { page, account } = params
    checkParams({ account: account ?? this._config.account })
    return await getEverpayTransactions(this._apiHost, {
      page,
      account: account ?? this._config.account
    })
  }

  async txByHash (everHash: string): Promise<EverpayTransaction> {
    checkParams({ everHash })
    return await getEverpayTransaction(this._apiHost, everHash)
  }

  async mintedTxByChainTxHash (chainTxHash: string): Promise<EverpayTransaction> {
    checkParams({ chainTxHash })
    return await getMintdEverpayTransactionByChainTxHash(this._apiHost, chainTxHash)
  }

  async deposit (params: DepositParams): Promise<EthereumTransaction | ArweaveTransaction> {
    await this.info()
    const { amount, symbol } = params
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList) as Token
    const value = utils.parseUnits(toBN(amount).toString(), token?.decimals)
    const from = this._config.account
    checkParams({ account: from, symbol, token, amount })

    return await transferAsync(this._config, this._cachedInfo as EverpayInfo, {
      symbol,
      token,
      from: from ?? '',
      value
    })
  }

  async getEverpayTxWithoutSig (type: 'transfer' | 'withdraw', params: TransferParams | WithdrawParams): Promise<EverpayTxWithoutSig> {
    const { symbol, amount, fee, quickMode } = params as WithdrawParams
    const to = params?.to as string
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    checkParams({ token })

    const from = this._config.account as string
    const accountChainType = getAccountChainType(from)
    let data = params.data
    let decimalFeeBN = toBN(0)
    let decimalOperateAmountBN = toBN(0)
    let action = EverpayAction.transfer

    if (type === 'transfer') {
      action = EverpayAction.transfer
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    } else if (type === 'withdraw') {
      const chainType = (params as WithdrawParams).chainType
      const tokenChainType = token?.chainType as string

      // 快速提现
      if (quickMode === true) {
        action = EverpayAction.transfer
        const expressInfo = await getExpressInfo(getEverpayExpressHost())
        const tokenTag = genTokenTag(token as Token)
        const foundExpressTokenData = expressInfo.tokens.find(t => matchTokenTag(tokenTag, t.tokenTag))
        if (foundExpressTokenData == null) {
          throw new Error(ERRORS.WITHDRAW_TOKEN_NOT_SUPPORT_QUICK_MODE)
        }

        // 快速提现的手续费，只放入 data 字段中
        const quickWithdrawFeeBN = fee !== undefined
          ? fromUnitToDecimalBN(fee, token?.decimals ?? 0)
          : toBN(foundExpressTokenData.withdrawFee)

        const expressData = genExpressData({
          chainType, to, fee: quickWithdrawFeeBN.toString()
        })
        data = data !== undefined ? { ...data, ...expressData } : { ...expressData }
        // 快速提现的 amount 为全部数量
        decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

        if (decimalOperateAmountBN.lte(quickWithdrawFeeBN)) {
          throw new Error(ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE)
        }

        // 普通提现
      } else {
        action = EverpayAction.withdraw
        decimalFeeBN = fee !== undefined ? fromUnitToDecimalBN(fee, token?.decimals ?? 0) : toBN(token?.burnFee ?? '0')
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
      feeRecipient: this._cachedInfo?.feeRecipient ?? '',
      nonce: Date.now().toString(),
      tokenID: token?.id as string,
      chainType: token?.chainType as string,
      chainID: token?.chainID as string,
      data: await getEverpayTxDataField(this._config, accountChainType, data),
      version: everpayTxVersion
    }
    return everpayTxWithoutSig
  }

  async getEverpayTxMessage (type: 'transfer' | 'withdraw', params: TransferParams | WithdrawParams): Promise<string> {
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig(type, params)
    return getEverpayTxMessage(everpayTxWithoutSig)
  }

  async sendEverpayTx (type: 'transfer' | 'withdraw', params: TransferParams | WithdrawParams): Promise<TransferOrWithdrawResult> {
    const { symbol, amount } = params
    const to = params?.to
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    const from = this._config.account as string
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig(type, params)

    checkParams({ account: from, symbol, token, amount, to })

    const { everHash, sig } = await signMessageAsync(this._config, everpayTxWithoutSig)
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

  async transfer (params: TransferParams): Promise<TransferOrWithdrawResult> {
    await this.info()
    return await this.sendEverpayTx('transfer', params)
  }

  async withdraw (params: WithdrawParams): Promise<TransferOrWithdrawResult> {
    await this.info()
    const to = params.to ?? this._config.account as string
    return await this.sendEverpayTx('withdraw', {
      ...params,
      to
    })
  }
}

export default Everpay
