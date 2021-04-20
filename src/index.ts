import { TransactionResponse } from '@ethersproject/abstract-provider'
import {
  ChainType, Config, EverpayInfo, EverpayBase, BalanceParams, DepositParams,
  TransferParams, WithdrawParams, EverpayTxWithoutSig, EverpayAction, EverpayTransaction
} from './global'
import { getEverpayBalance, getEverpayInfo, getEverpayTransactions, postTx } from './api'
import { burnFeeAmount, getEverpayHost } from './config'
import { getTimestamp, getTokenBySymbol, toBN } from './utils/util'
import { GetEverpayBalanceParams, PostEverpayTxResult } from './api/interface'
import erc20Abi from './constants/abi/erc20'
import { Signer, ethers } from 'ethers'
import { checkParams } from './utils/check'

class Everpay extends EverpayBase {
  constructor (config?: Config) {
    super()
    this._config = {
      ...config,
      account: config?.account?.toLowerCase() ?? ''
    }
    this._apiHost = getEverpayHost(config?.debug)
    this._cachedTimestamp = 0
  }

  private readonly _apiHost: string
  private readonly _config: Config
  private _cachedInfo?: EverpayInfo
  private _cachedTimestamp: number

  async info (): Promise<EverpayInfo> {
    // cache info 3 mins
    if (this._cachedInfo === undefined || (getTimestamp() - 3 * 60 > this._cachedTimestamp)) {
      this._cachedInfo = await getEverpayInfo(this._apiHost)
      this._cachedTimestamp = getTimestamp()
    }
    return this._cachedInfo
  }

  async balance (params?: BalanceParams): Promise<number> {
    await this.info()
    params = (params ?? {}) as BalanceParams
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
    return toBN(ethers.utils.formatUnits(everpayBalance.balance, token?.decimals)).toNumber()
  }

  async txs (): Promise<EverpayTransaction[]> {
    return await getEverpayTransactions(this._apiHost)
  }

  async txsByAccount (account?: string): Promise<EverpayTransaction[]> {
    checkParams({ account: account ?? this._config.account })
    return await getEverpayTransactions(this._apiHost, account ?? this._config.account)
  }

  async deposit (params: DepositParams): Promise<TransactionResponse> {
    await this.info()
    const { amount, symbol } = params
    const connectedSigner = this._config?.connectedSigner as Signer
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    const value = ethers.utils.parseUnits(amount.toString(), token?.decimals)
    const from = this._config.account
    const to = this._cachedInfo?.ethLocker
    let everpayTx: TransactionResponse
    checkParams({ account: from, symbol, token, signer: connectedSigner, amount })

    // TODO: check balance
    if (symbol.toLowerCase() === 'eth') {
      const transactionRequest = {
        from,
        to,
        value
      }
      everpayTx = await connectedSigner.sendTransaction(transactionRequest)
    } else {
      const erc20RW = new ethers.Contract(token?.id ?? '', erc20Abi, connectedSigner)
      everpayTx = await erc20RW.transfer(to, value)
    }

    return everpayTx
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
    const connectedSigner = this._config?.connectedSigner as Signer
    return connectedSigner.signMessage(message)
  }

  async sendEverpayTx (action: EverpayAction, params: TransferParams): Promise<PostEverpayTxResult> {
    await this.info()
    const { chainType, symbol, to, amount } = params
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    const from = this._config.account as string
    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: symbol,
      action,
      from,
      to,
      amount: ethers.utils.parseUnits(amount.toString(), token?.decimals).toString(),
      // Warning: 写死 0
      fee: '0',
      feeRecipient: this._cachedInfo?.feeRecipient ?? '',
      nonce: Date.now().toString(),
      tokenID: token?.id as string,
      chainType: chainType,
      data: '',
      version: this._cachedInfo?.txVersion ?? 'v1'
    }
    checkParams({ symbol, account: from, token, signer: this._config?.connectedSigner, amount })

    const sig = await this.getEverpaySignMessage(everpayTxWithoutSig)
    return await postTx(this._apiHost, {
      ...everpayTxWithoutSig,
      sig,
      chainID: this._cachedInfo?.ethChainID.toString() ?? '1'
    })
  }

  async transfer (params: TransferParams): Promise<PostEverpayTxResult> {
    return await this.sendEverpayTx(EverpayAction.transfer, params)
  }

  async withdraw (params: WithdrawParams): Promise<PostEverpayTxResult> {
    // Warning: 提现 收 0.01，还需要针对 erc 20，单独定义
    const amount = params.amount - burnFeeAmount
    const to = params.to ?? this._config.account as string
    return await this.sendEverpayTx(EverpayAction.withdraw, {
      ...params,
      amount,
      to
    })
  }
}

export default Everpay
