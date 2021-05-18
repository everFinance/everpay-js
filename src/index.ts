import { TransactionResponse } from '@ethersproject/abstract-provider'
import {
  ChainType, Config, EverpayInfo, EverpayBase, BalanceParams, BalancesParams, DepositParams,
  TransferOrWithdrawResult, TransferParams, WithdrawParams, EverpayTxWithoutSig, EverpayAction,
  EverpayTransaction, BalanceItem
} from './global'
import { getEverpayBalance, getEverpayBalances, getEverpayInfo, getEverpayTransactions, postTx } from './api'
import { everpayTxVersion, getEverpayHost } from './config'
import { getTimestamp, getTokenBySymbol, toBN } from './utils/util'
import { GetEverpayBalanceParams, GetEverpayBalancesParams } from './api/interface'
import erc20Abi from './constants/abi/erc20'
import { Contract, Signer, utils } from 'ethers'
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

  async balance (params: BalanceParams): Promise<number> {
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
    return toBN(utils.formatUnits(everpayBalance.balance.amount, everpayBalance.balance.decimals)).toNumber()
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
        balance: toBN(utils.formatUnits(item.amount, item.decimals)).toNumber()
      }
    })
    return balances
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
    const value = utils.parseUnits(amount.toString(), token?.decimals)
    const from = this._config.account?.toLowerCase()
    const to = this._cachedInfo?.ethLocker.toLowerCase()
    let transactionResponse: TransactionResponse
    checkParams({ account: from, symbol, token, signer: connectedSigner, amount })

    // TODO: check balance
    if (symbol.toLowerCase() === 'eth') {
      const transactionRequest = {
        from,
        to,
        value
      }
      transactionResponse = await connectedSigner.sendTransaction(transactionRequest)
    } else {
      const erc20RW = new Contract(token?.id ?? '', erc20Abi, connectedSigner)
      transactionResponse = await erc20RW.transfer(to, value)
    }

    return transactionResponse
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
      'chainID',
      'data',
      'version'
    ] as const
    const message = keys.map(key => `${key}:${everpayTxWithoutSig[key]}`).join('\n')
    const connectedSigner = this._config?.connectedSigner as Signer
    return connectedSigner.signMessage(message)
  }

  async sendEverpayTx (action: EverpayAction, params: TransferParams): Promise<TransferOrWithdrawResult> {
    const { chainType, symbol, amount } = params
    const to = params?.to.toLowerCase()
    const token = getTokenBySymbol(symbol, this._cachedInfo?.tokenList)
    const from = this._config.account?.toLowerCase() as string
    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: symbol,
      action,
      from,
      to,
      amount: utils.parseUnits(amount.toString(), token?.decimals).toString(),
      fee: action === EverpayAction.withdraw ? (token?.burnFee ?? '0') : '0',
      feeRecipient: this._cachedInfo?.feeRecipient.toLowerCase() ?? '',
      nonce: Date.now().toString(),
      tokenID: token?.id.toLowerCase() as string,
      chainType: chainType,
      chainID: this._cachedInfo?.ethChainID.toString() ?? '',
      data: '',
      version: everpayTxVersion
    }
    checkParams({ symbol, account: from, token, signer: this._config?.connectedSigner, amount })

    const sig = await this.getEverpaySignMessage(everpayTxWithoutSig)
    const everpayTx = {
      ...everpayTxWithoutSig,
      sig,
      chainID: this._cachedInfo?.ethChainID.toString() ?? '1'
    }
    const postEverpayTxResult = await postTx(this._apiHost, everpayTx)
    return {
      ...postEverpayTxResult,
      everpayTx
    }
  }

  async transfer (params: TransferParams): Promise<TransferOrWithdrawResult> {
    await this.info()
    return await this.sendEverpayTx(EverpayAction.transfer, params)
  }

  async withdraw (params: WithdrawParams): Promise<TransferOrWithdrawResult> {
    await this.info()
    const token = getTokenBySymbol(params.symbol, this._cachedInfo?.tokenList)
    checkParams({ token })
    const amount = toBN(params.amount).minus(toBN(utils.formatUnits(token?.burnFee ?? '', token?.decimals))).toNumber()
    const to = params.to ?? this._config.account as string
    return await this.sendEverpayTx(EverpayAction.withdraw, {
      ...params,
      amount,
      to
    })
  }
}

export default Everpay
