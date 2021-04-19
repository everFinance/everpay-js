import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Config, EverpayInfo, EverpayBase, BalanceParams, DepositParams, TransferWithdrawParams, EverpayTxWithoutSig, EverpayAction } from './global'
import { getEverpayBalance, getEverpayInfo, postTx } from './api'
import { burnFeeAmount, getEverpayHost } from './config'
import { fromDecimalToUnit, fromUnitToDecimal, getTokenBySymbol } from './utils/util'
import { PostEverpayTxResult } from './api/interface'

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
      // TODO: cache timestamp
      this._cachedInfo = await getEverpayInfo(this._apiHost)
    }
    return this._cachedInfo
  }

  async balance (params?: BalanceParams): Promise<number> {
    if (this._cachedInfo === undefined) {
      await this.info()
    }
    params = params ?? {}
    // TODO: validation, not supported Token
    const { tokenSymbol, account } = params
    const token = getTokenBySymbol(tokenSymbol ?? 'eth', this._cachedInfo?.tokenList)
    const mergedParams = {
      id: token.id,
      chainType: params.chainType ?? token.chainType,
      tokenSymbol: params.tokenSymbol ?? token.tokenSymbol,
      account: account ?? this._config.account
    }
    const everpayBalance = await getEverpayBalance(this._apiHost, mergedParams)
    return fromDecimalToUnit(everpayBalance.balance, token.decimals).toNumber()
  }

  async deposit (params: DepositParams): Promise<TransactionResponse> {
    const { amount } = params
    const eth = this._cachedInfo?.tokenList.find(t => t.tokenSymbol === 'ETH')
    const value = fromUnitToDecimal(amount, eth?.decimals ?? 18, 10)
    // TODO: validation
    // TODO: erc20
    const transactionRequest = {
      from: this._config.account,
      to: this._cachedInfo?.ethLocker,
      value
    }
    const connectedSigner = this._config?.connectedSigner
    return connectedSigner.sendTransaction(transactionRequest)
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
    return connectedSigner.signMessage(message)
  }

  async sendEverpayTx (action: EverpayAction, params: TransferWithdrawParams): Promise<PostEverpayTxResult> {
    const { chainType, tokenSymbol, to, amount } = params
    const token = getTokenBySymbol(tokenSymbol, this._cachedInfo?.tokenList)
    // TODO: validation
    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol,
      action,
      from: this._config.account,
      to,
      amount: fromUnitToDecimal(amount, token.decimals, 10),
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
