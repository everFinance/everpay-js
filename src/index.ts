import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Config, EverpayInfo, EverpayBase, BalanceParams, DepositParams, TransferWithdrawParams, EverpayTxWithoutSig, EverpayAction } from './global'
import { getEverpayBalance, getEverpayInfo, postTx } from './api'
import { burnFeeAmount, getEverpayHost } from './config'
import { getTokenBySymbol, toBN } from './utils/util'
import { PostEverpayTxResult } from './api/interface'
import erc20Abi from './constants/abi/erc20'
import { ERRORS } from './utils/errors'
import { ethers } from 'ethers'

class Everpay extends EverpayBase {
  constructor (config: Config) {
    super()
    this._config = {
      ...config,
      account: config.account?.toLowerCase() ?? ''
    }
    this._apiHost = getEverpayHost(config.debug)
    // this.cachedTimestamp = 0
  }

  private readonly _apiHost: string
  private readonly _config: Config
  private _cachedInfo?: EverpayInfo
  // cachedTimestamp: number

  async info (): Promise<EverpayInfo> {
    if (this._cachedInfo === undefined) {
      // TODO: cache timestamp
      this._cachedInfo = await getEverpayInfo(this._apiHost)
    }
    return this._cachedInfo
  }

  async balance (params?: BalanceParams): Promise<number> {
    await this.info()
    params = params ?? {}
    // TODO: validation, not supported Token
    const { symbol, account } = params
    const token = getTokenBySymbol(symbol ?? 'eth', this._cachedInfo?.tokenList)
    const mergedParams = {
      id: token.id,
      chainType: params.chainType ?? token.chainType,
      symbol: params.symbol ?? token.symbol,
      account: account ?? this._config.account as string
    }
    const everpayBalance = await getEverpayBalance(this._apiHost, mergedParams)
    return toBN(ethers.utils.formatUnits(everpayBalance.balance, token.decimals)).toNumber()
  }

  async deposit (params: DepositParams): Promise<TransactionResponse> {
    await this.info()
    const { amount, symbol } = params
    const connectedSigner = this._config?.connectedSigner
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    const value = ethers.utils.parseUnits(amount.toString(), token.decimals)

    if (connectedSigner === undefined) {
      throw new Error(ERRORS.SIGENER_NOT_EXIST)
    }

    const from = this._config.account
    const to = this._cachedInfo?.ethLocker

    // TODO: validation
    if (symbol.toLowerCase() === 'eth') {
      const transactionRequest = {
        from,
        to,
        value
      }
      return await connectedSigner.sendTransaction(transactionRequest)
    } else {
      const erc20RW = new ethers.Contract(token.id ?? '', erc20Abi, connectedSigner)
      return erc20RW.transfer(to, value)
    }
  }

  async getEverpaySignMessage (everpayTxWithoutSig: EverpayTxWithoutSig): Promise<string> {
    const keys = [
      'tokenSymbol',
      'action',
      'from',
      'to',
      'amount',
      'fee',
      'feeRecipient',
      'nonce',
      'tokenID',
      'chainType',
      'data',
      'version'
    ] as const
    const message = keys.map(key => `${key}:${everpayTxWithoutSig[key]}`).join('\n')
    const connectedSigner = this._config?.connectedSigner

    if (connectedSigner === undefined) {
      throw new Error(ERRORS.SIGENER_NOT_EXIST)
    }

    return connectedSigner.signMessage(message)
  }

  async sendEverpayTx (action: EverpayAction, params: TransferWithdrawParams): Promise<PostEverpayTxResult> {
    await this.info()
    const { chainType, symbol, to, amount } = params
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    // TODO: validation
    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: symbol,
      action,
      from: this._config.account as string,
      to,
      amount: ethers.utils.parseUnits(amount.toString(), token.decimals).toString(),
      // TODO: 写死 0
      fee: '0',
      feeRecipient: this._cachedInfo?.feeRecipient ?? '',
      nonce: Date.now().toString(),
      tokenID: token.id,
      chainType: chainType,
      data: '',
      version: this._cachedInfo?.txVersion ?? 'v1'
    }
    const sig = await this.getEverpaySignMessage(everpayTxWithoutSig)
    return await postTx(this._apiHost, {
      ...everpayTxWithoutSig,
      sig,
      chainID: this._cachedInfo?.ethChainID.toString() ?? '1'
    })
  }

  async transfer (params: TransferWithdrawParams): Promise<PostEverpayTxResult> {
    return await this.sendEverpayTx(EverpayAction.transfer, params)
  }

  async withdraw (params: TransferWithdrawParams): Promise<PostEverpayTxResult> {
    // TODO: 提现 收 0.01，还需要针对 erc 20，单独定义
    const amount = params.amount - burnFeeAmount
    return await this.sendEverpayTx(EverpayAction.withdraw, {
      ...params,
      amount
    })
  }
}

export default Everpay
