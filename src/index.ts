import { getEverpayTxMessage, signMessageAsync, signRegisterAsync, transferAsync, getRedPackTxMessage } from './lib/sign'
import { getEverpayBalance, getEverpayBalances, getEverpayInfo, getEverpayTransaction, getEverpayTransactions, getExpressInfo, getMintdEverpayTransactionByChainTxHash, postTx, getFees, getFee, getEmailRegisterData, getAccountData, verifySig } from './api'
import { everpayTxVersion, getExpressHost, getEverpayHost } from './config'
import { getTimestamp, toBN, getAccountChainType, fromDecimalToUnit, genTokenTag, matchTokenTag, genExpressData, fromUnitToDecimalBN, genBundleData, getTokenBurnFeeByChainType, getChainDecimalByChainType, isArweaveChainPSTMode, getTokenByTag, isArweaveL2PSTTokenSymbol, isSmartAccount, genEverId, getUserId, isArweaveAddress, uint8ArrayToHex, isEthereumAddress } from './utils/util'
import { GetEverpayBalanceParams, GetEverpayBalancesParams, GetEverpayTransactionsParams } from './types/api'
import { checkParams } from './utils/check'
import sha256 from 'crypto-js/sha256'
import {
  CliamParams,
  Config,
  EverpayInfo,
  EverpayBase,
  BalanceParams,
  BalancesParams,
  DepositParams,
  SendEverpayTxResult,
  TransferParams,
  WithdrawParams,
  EverpayTxWithoutSig,
  EverpayAction,
  BundleData,
  FeeItem,
  ChainType,
  BalanceItem,
  TxsParams,
  TxsByAccountParams,
  TxsResult,
  EverpayTransaction,
  Token,
  EthereumTransaction,
  ArweaveTransaction,
  ExpressInfo,
  CachedInfo,
  InternalTransferItem,
  BundleDataWithSigs,
  BundleParams,
  EverpayTx,
  AddTokenSet,
  NewToken, SetParams, TargetChainMeta, AddTargetChainSet, TokenDisplaySet, OwnershipSet, EmailRegisterData, EmailRegisterDataWithCode, VerifyMessageResult, VerifyMessageParams, SignMessageResult, SmartAccountAuthResult
} from './types'
import { ERRORS } from './utils/errors'
import { utils } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

import { openPopup, runPopup } from './lib/popup'
import { EVERPAY_JS_VERSION } from './constants'
import hashPersonalMessage from './lib/hashPersonalMessage'
import isString from 'lodash/isString'

export * from './types'

const _cachedInfo: CachedInfo = {} as any
const cacheHelper = async (key: 'everpay' | 'express', host: string): Promise<EverpayInfo | ExpressInfo> => {
  const timestamp = getTimestamp()
  // cache info 3 mins
  if (_cachedInfo[key]?.value != null &&
    (_cachedInfo[key] as any).timestamp > timestamp - 3 * 60) {
    return _cachedInfo[key]?.value as EverpayInfo | ExpressInfo
  }

  if (key === 'everpay') {
    const value = await getEverpayInfo(host)
    _cachedInfo[key] = { value, timestamp }
  } else if (key === 'express') {
    const value = await getExpressInfo(host)
    _cachedInfo[key] = { value, timestamp }
  }
  return _cachedInfo[key]?.value as EverpayInfo | ExpressInfo
}

class Everpay extends EverpayBase {
  constructor (config?: Config) {
    super()
    this._config = {
      ...config,
      account: config?.account ?? '',
      chainType: config?.chainType ?? ChainType.ethereum
    }
    this._apiHost = getEverpayHost(config?.debug)
    this._expressHost = getExpressHost(config?.debug)
  }

  private readonly _apiHost: string
  private readonly _expressHost: string
  private readonly _config: Config

  getAccountChainType = getAccountChainType

  async info (): Promise<EverpayInfo> {
    const result = await cacheHelper('everpay', this._apiHost)
    return result as EverpayInfo
  }

  async expressInfo (): Promise<ExpressInfo> {
    const result = await cacheHelper('express', this._expressHost)
    return result as ExpressInfo
  }

  async getEmailRegisterData (): Promise<EmailRegisterData> {
    const result = await getEmailRegisterData(this._apiHost, this._config.account as string)
    return result
  }

  async getAccountData (): Promise<any> {
    const acc = isSmartAccount(this._config.account as string) ? genEverId(this._config.account as string) : this._config.account as string
    const result = await getAccountData(this._apiHost, acc)
    return result
  }

  async balance (params: BalanceParams): Promise<string> {
    await this.info()
    const { tag, account } = params
    const accTemp = account ?? this._config.account as string
    const acc = isSmartAccount(accTemp) ? genEverId(accTemp) : accTemp
    const token = getTokenByTag(tag, _cachedInfo?.everpay?.value.tokenList)
    checkParams({ account: acc, tag, token })
    const mergedParams: GetEverpayBalanceParams = {
      tokenTag: genTokenTag(token as Token),
      account: acc
    }
    const everpayBalance = await getEverpayBalance(this._apiHost, mergedParams)
    return fromDecimalToUnit(everpayBalance.balance.amount, everpayBalance.balance.decimals)
  }

  async balances (params?: BalancesParams): Promise<BalanceItem[]> {
    const info = await this.info()
    params = (params ?? {}) as BalanceParams
    const { account } = params
    const accTemp = account ?? this._config.account as string
    const acc = isSmartAccount(accTemp) ? genEverId(accTemp) : accTemp
    checkParams({ account: acc })
    const mergedParams: GetEverpayBalancesParams = {
      account: acc
    }
    const everpayBalances = await getEverpayBalances(this._apiHost, mergedParams)
    const argTag = !this._config.debug ? 'bsc-arg-0xb5eadfdbdb40257d1d24a1432faa2503a867c270' : 'bsc-arg-0x7846cf6e181bb5c909d6010d15af5fffd3b61229'
    const fraTag = !this._config.debug ? 'bsc-fra-0xeb042ffdabc535de2716c6b51a965f124050d4e1' : 'bsc-fra-0xa98242557818f0135b2381893caec3d4a64f88e5'
    const deleteTag = [
      argTag,
      fraTag
    ]
    const balances = everpayBalances.balances.filter((t) => t.tag !== deleteTag[0] && t.tag !== deleteTag[1]).map(item => {
      const tag = item.tag
      const token = info.tokenList.find(token => token.tag === tag) as Token
      return {
        chainType: token?.chainType,
        symbol: token?.symbol.toUpperCase(),
        tag: token?.tag,
        address: token.id,
        balance: fromDecimalToUnit(item.amount, item.decimals)
      }
    })
    return balances
  }

  private async getMergedTxsParams (params: TxsParams): Promise<GetEverpayTransactionsParams> {
    const { page, tag, action, withoutAction, cursor } = params
    const mergedParams: GetEverpayTransactionsParams = {}
    if (page !== undefined) {
      mergedParams.page = page
    }
    if (cursor !== undefined) {
      mergedParams.cursor = cursor
    }
    if (tag !== undefined) {
      await this.info()
      const token = getTokenByTag(tag, _cachedInfo?.everpay?.value.tokenList) as Token
      checkParams({ token })
      mergedParams.tokenTag = token.tag
    }
    if (action !== undefined) {
      checkParams({ action })
      mergedParams.action = action
    }
    if (withoutAction !== undefined) {
      mergedParams.withoutAction = withoutAction
    }
    return mergedParams
  }

  async txs (params: TxsParams): Promise<TxsResult> {
    const mergedParams: GetEverpayTransactionsParams = await this.getMergedTxsParams(params)
    return await getEverpayTransactions(this._apiHost, mergedParams)
  }

  async txsByAccount (params: TxsByAccountParams): Promise<TxsResult> {
    const accTemp = params.account ?? this._config.account as string
    const acc = isSmartAccount(accTemp) ? genEverId(accTemp) : accTemp
    checkParams({ account: acc })
    const mergedParams: GetEverpayTransactionsParams = await this.getMergedTxsParams(params)
    mergedParams.account = acc
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

  async fee (tag: string): Promise<FeeItem> {
    await this.info()
    const token = getTokenByTag(tag, _cachedInfo?.everpay?.value.tokenList) as Token
    checkParams({ tag, token })
    return await getFee(this._apiHost, genTokenTag(token))
  }

  async smartAccountAuth (logo: string): Promise<SmartAccountAuthResult> {
    const debug = Boolean(this._config.debug)
    const url = `https://beta${debug ? '-dev' : ''}.everpay.io/auth?host=${encodeURIComponent(window.location.host)}&logo=${encodeURIComponent(logo)}&version=${EVERPAY_JS_VERSION}`
    // const url = `http://localhost:8080/auth?host=${encodeURIComponent(window.location.host)}&logo=${encodeURIComponent(logo)}&version=${EVERPAY_JS_VERSION}`
    const popup = await openPopup(url)
    return await runPopup({
      popup,
      type: 'auth'
    })
  }

  genEverId (account?: string): string {
    const acc = account ?? this._config.account as string
    return isSmartAccount(acc) ? genEverId(acc) : acc
  }

  hashMessage (message: string): string {
    const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(message))
    const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`
    return personalMsgHex
  }

  async signMessage (message: string, smartAccountDirectly?: boolean): Promise<SignMessageResult> {
    if (!isString(message)) {
      throw new Error(ERRORS.MESSAGE_INCORRECT)
    }
    if (isSmartAccount(this._config.account as string)) {
      if (smartAccountDirectly != null) {
        if (message.length >= 96) {
          const { sig } = await signMessageAsync(this._config, message, undefined, true)
          return { message, sig }
        } else {
          throw new Error(ERRORS.MESSAGE_INCORRECT)
        }
      } else {
        const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(message))
        const messageHash = `0x${personalMsgHashBuffer.toString('hex')}`
        const { sig } = await signMessageAsync(this._config, message)
        return { message: messageHash, sig }
      }
    } else {
      const { sig } = await signMessageAsync(this._config, message)
      return { message, sig }
    }
  }

  async verifyMessage (params: VerifyMessageParams): Promise<VerifyMessageResult> {
    const { account, message, type, sig } = params
    const everId = this.genEverId(account)
    let messageHash = ''

    if (isEthereumAddress(account)) {
      const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(message))
      messageHash = `0x${personalMsgHashBuffer.toString('hex')}`
    } else if (isArweaveAddress(account)) {
      messageHash = `0x${sha256(message).toString()}`
    } else if (isSmartAccount(account)) {
      messageHash = `0x${uint8ArrayToHex(Buffer.from(message))}`
    } else {
      throw new Error(ERRORS.ACCOUNT_INVALID)
    }

    const [splitSig, splitPublic] = sig.split(',')
    return await verifySig(this._apiHost, {
      account: everId,
      message: messageHash,
      type,
      sig: splitSig,
      public: splitPublic
    })
  }

  async deposit (params: DepositParams): Promise<EthereumTransaction | ArweaveTransaction> {
    await this.info()
    const { amount, tag } = params
    const from = this._config.account
    const token = getTokenByTag(tag, _cachedInfo?.everpay?.value.tokenList) as Token
    const chainType = this._config.chainType
    checkParams({ account: from, tag, token, amount })

    // arweave 上的 PST 充值必须是整数
    if (isArweaveChainPSTMode(token) && chainType === ChainType.arweave && !isArweaveL2PSTTokenSymbol(token.symbol) && parseInt(amount) !== +amount) {
      throw new Error(ERRORS.DEPOSIT_ARWEAVE_PST_MUST_BE_INTEGER)
    }

    const chainDecimal = getChainDecimalByChainType(token, chainType as ChainType)
    const value = utils.parseUnits(toBN(amount).toString(), chainDecimal)

    return await transferAsync(this._config, _cachedInfo.everpay?.value as EverpayInfo, {
      symbol: token.symbol,
      token,
      from: from ?? '',
      value
    })
  }

  // amount 为实际收款数量
  async getEverpayTxWithoutSig (
    type: 'transfer' | 'withdraw' | 'bundle' | 'set' | 'setAcc',
    params: TransferParams | WithdrawParams | BundleParams | SetParams
  ): Promise<EverpayTxWithoutSig> {
    if (_cachedInfo?.everpay?.value == null) {
      await this.info()
    }
    const { tag, amount, fee, quickMode } = params as WithdrawParams
    const token = getTokenByTag(tag, _cachedInfo?.everpay?.value.tokenList)
    const from = this._config.account as string
    let data = params.data
    let to = params?.to as string
    let decimalFeeBN = toBN(0)
    let decimalOperateAmountBN = toBN(0)
    let action = EverpayAction.transfer

    checkParams({ account: from, tag, token, to })

    if (type === 'transfer') {
      checkParams({ amount })
      action = EverpayAction.transfer
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)
    } else if (type === 'bundle') {
      action = EverpayAction.bundle
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    } else if (type === 'set') {
      action = EverpayAction.set
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)
    } else if (type === 'setAcc') {
      action = EverpayAction.setAcc
      decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)
    } else if (type === 'withdraw') {
      checkParams({ amount })
      const chainType = (params as WithdrawParams).chainType

      // PST 提现到 arweave 网络必须是整数
      if (isArweaveChainPSTMode(token) && chainType === ChainType.arweave && !isArweaveL2PSTTokenSymbol(token?.symbol as string) && parseInt(amount) !== +amount) {
        throw new Error(ERRORS.PST_WITHDARW_TO_ARWEAVE_MUST_BE_INTEGER)
      }

      const balance = await this.balance({ tag })
      const decimalBalanceBN = fromUnitToDecimalBN(balance, token?.decimals ?? 0)

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
        decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0).plus(quickWithdrawFeeBN)

        if (decimalOperateAmountBN.gt(decimalBalanceBN)) {
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

        const targetChainType = chainType
        data = data !== undefined ? { ...data, targetChainType } : { targetChainType }
        decimalOperateAmountBN = fromUnitToDecimalBN(amount, token?.decimals ?? 0)

        if (decimalOperateAmountBN.plus(decimalFeeBN).gt(decimalBalanceBN)) {
          throw new Error(ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE)
        }
      }
    }

    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: token?.symbol as string,
      action,
      from: isSmartAccount(from) ? genEverId(from) : from,
      to: isSmartAccount(to) ? genEverId(to) : to,
      amount: decimalOperateAmountBN.toString(),
      fee: decimalFeeBN.toString(),
      feeRecipient: _cachedInfo?.everpay?.value.feeRecipient ?? '',
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

  async signedEverpayTx (everpayTxWithoutSig: EverpayTxWithoutSig): Promise<{everpayTx: EverpayTx, everHash: string}> {
    const messageData = getEverpayTxMessage(everpayTxWithoutSig)
    const { sig, everHash } = await signMessageAsync(this._config, messageData)
    const everpayTx = {
      ...everpayTxWithoutSig,
      sig
    }
    return { everpayTx, everHash }
  }

  // sig redpacket
  async signedRedPackTx (redPackTxSig: CliamParams): Promise<{redpackTx: CliamParams, everHash: string}> {
    const messageData = getRedPackTxMessage(redPackTxSig)
    const { sig, everHash } = await signMessageAsync(this._config, messageData)
    const redpackTx = {
      ...redPackTxSig,
      signature: sig
    }
    return { redpackTx, everHash }
  }

  async sendEverpayTx (everpayTxWithoutSig: EverpayTxWithoutSig): Promise<SendEverpayTxResult> {
    const { everpayTx, everHash } = await this.signedEverpayTx(everpayTxWithoutSig)
    const postEverpayTxResult = await postTx(this._apiHost, everpayTx)
    return {
      ...postEverpayTxResult,
      everpayTx,
      everHash
    }
  }

  async register (params?: EmailRegisterDataWithCode, attachment?: string): Promise<SendEverpayTxResult> {
    if (_cachedInfo?.everpay?.value == null) {
      await this.info()
    }
    const everpayInfo = _cachedInfo?.everpay?.value as EverpayInfo
    const token = everpayInfo.tokenList.find((t) => {
      return t.symbol.toUpperCase() === 'ETH'
    }) as any
    const everpayTxWithoutSig: EverpayTxWithoutSig = {
      tokenSymbol: token?.symbol as string,
      action: 'register' as any,
      from: isSmartAccount(this._config.account as string) ? genEverId(this._config.account as string) : this._config.account as string,
      to: isSmartAccount(this._config.account as string) ? genEverId(this._config.account as string) : this._config.account as string,
      amount: '0',
      fee: '0',
      feeRecipient: _cachedInfo?.everpay?.value.feeRecipient ?? '',
      nonce: Date.now().toString(),
      tokenID: token?.id as string,
      chainType: token?.chainType as string,
      chainID: token?.chainID as string,
      data: params !== undefined ? JSON.stringify({ mailVerify: params }) : '',
      version: everpayTxVersion
    }
    const messageData = getEverpayTxMessage(everpayTxWithoutSig)
    const { sig, everHash } = await signRegisterAsync(this._config, messageData, attachment)
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
    if (_cachedInfo?.everpay?.value == null) {
      await this.info()
    }
    const to = params.to ?? this._config.account as string
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('withdraw', {
      ...params,
      to
    })
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async getBundleData (items: InternalTransferItem[], expiration?: number, data?: string): Promise<BundleData> {
    if (_cachedInfo?.everpay?.value == null) {
      await this.info()
    }
    return genBundleData({
      items,
      tokenList: _cachedInfo.everpay?.value?.tokenList as Token[],
      // 设置 60s 过期
      expiration: expiration ?? Math.round(Date.now() / 1000) + 60,
      data
    })
  }

  async signBundleData (bundleData: BundleData | BundleDataWithSigs): Promise<BundleDataWithSigs> {
    const { items, expiration, salt, version, data } = bundleData
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      // 只签名这几个字段，并且顺序需要保持一致
      items, expiration, salt, version
    }))
    const sigs = (bundleData as BundleDataWithSigs).sigs != null ? (bundleData as BundleDataWithSigs).sigs : {}
    const acc = isSmartAccount(this._config.account as string) ? genEverId(this._config.account as string) : this._config.account as string
    sigs[acc] = sig
    return {
      items, expiration, salt, version, sigs, data
    }
  }

  async bundle (params: BundleParams): Promise<SendEverpayTxResult> {
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('bundle', params)
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async signAddTokenSet (newToken: NewToken): Promise<AddTokenSet> {
    const addToken: AddTokenSet = {
      action: 'addToken',
      operator: this._config.account as string,
      salt: uuidv4(),
      version: 'v1',
      expiration: Math.round(Date.now() / 1000) + 100,
      token: newToken,
      sig: ''
    }
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      action: addToken.action,
      operator: addToken.operator,
      salt: addToken.salt,
      version: addToken.version,
      expiration: addToken.expiration,
      token: addToken.token
    }))
    addToken.sig = sig
    return addToken
  }

  async signAddTargetChainSet (tokenTag: string, targetChain: TargetChainMeta): Promise<AddTargetChainSet> {
    const addTargetChain: AddTargetChainSet = {
      action: 'addTargetChain',
      operator: this._config.account as string,
      salt: uuidv4(),
      version: 'v1',
      expiration: Math.round(Date.now() / 1000) + 100,
      tokenTag: tokenTag,
      targetChain: targetChain,
      sig: ''
    }
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      action: addTargetChain.action,
      operator: addTargetChain.operator,
      salt: addTargetChain.salt,
      version: addTargetChain.version,
      expiration: addTargetChain.expiration,
      tokenTag: addTargetChain.tokenTag,
      targetChain: addTargetChain.targetChain
    }))
    addTargetChain.sig = sig
    return addTargetChain
  }

  async signTokenDisplaySet (tokenTag: string, display: boolean): Promise<TokenDisplaySet> {
    const tokenDisplay: TokenDisplaySet = {
      action: 'setTokenDisplay',
      operator: this._config.account as string,
      salt: uuidv4(),
      version: 'v1',
      expiration: Math.round(Date.now() / 1000) + 100,
      tokenTag: tokenTag,
      display: display,
      sig: ''
    }
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      action: tokenDisplay.action,
      operator: tokenDisplay.operator,
      salt: tokenDisplay.salt,
      version: tokenDisplay.version,
      expiration: tokenDisplay.expiration,
      tokenTag: tokenDisplay.tokenTag,
      display: tokenDisplay.display
    }))
    tokenDisplay.sig = sig
    return tokenDisplay
  }

  async signOwnershipSet (newOwner: string): Promise<OwnershipSet> {
    const ownership: OwnershipSet = {
      action: 'transferOwnership',
      operator: this._config.account as string,
      salt: uuidv4(),
      version: 'v1',
      expiration: Math.round(Date.now() / 1000) + 100,
      newOwner: newOwner,
      sig: ''
    }
    const { sig } = await signMessageAsync(this._config, JSON.stringify({
      action: ownership.action,
      operator: ownership.operator,
      salt: ownership.salt,
      version: ownership.version,
      expiration: ownership.expiration,
      newOwner: ownership.newOwner
    }))
    ownership.sig = sig
    return ownership
  }

  async setTx (setData: any): Promise<SendEverpayTxResult> {
    const setParams: SetParams = { amount: '0', data: setData, symbol: 'eth', to: this._config.account as string }
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('set', setParams)
    return await this.sendEverpayTx(everpayTxWithoutSig)
  }

  async setAcc (data: any, accountData?: any): Promise<SendEverpayTxResult> {
    const params = {
      amount: '0',
      data,
      tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
      to: this._config.account as string
    }
    const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('setAcc', params)

    const messageData = getEverpayTxMessage(everpayTxWithoutSig)
    const { sig, everHash } = await signMessageAsync(this._config, messageData, accountData)
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
}

export default Everpay
