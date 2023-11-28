import { SignMessageAsyncResult, TransferAsyncParams } from './interface'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import smartAccountLib from './smartAccount'
import { ArJWK, ChainType, Config, EverpayInfo, EverpayTxWithoutSig, EthereumTransaction, ArweaveTransaction } from '../types'
import { checkSignConfig } from '../utils/check'
import { CliamParams } from '../types'
import { Signer } from '@ethersproject/abstract-signer'
import { ERRORS } from '../utils/errors'
import hashPersonalMessage from './hashPersonalMessage'
import { isNodeJs } from '../utils/util'
import { openPopup, runPopup } from './popup'

const getDepositAddr = (info: EverpayInfo, accountChainType: ChainType): string => {
  if (accountChainType === ChainType.ethereum) {
    return info?.lockers.ethereum
  } else if (accountChainType === ChainType.arweave) {
    // AR 大小写敏感
    return info?.lockers.arweave
  } else if (accountChainType === ChainType.moon) {
    return info?.lockers.moon
  } else if (accountChainType === ChainType.conflux) {
    return info?.lockers.conflux
  } else if (accountChainType === ChainType.bsc) {
    return info?.lockers.bsc
  } else if (accountChainType === ChainType.platon) {
    return info?.lockers.platon
  }
  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

export const getEverpayTxMessage = (everpayTxWithoutSig: EverpayTxWithoutSig): string => {
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
  return keys.map(key => `${key}:${everpayTxWithoutSig[key]}`).join('\n')
}

export const signRegisterAsync = async (config: Config, messageData: string): Promise<SignMessageAsyncResult> => {
  const from = config.account as string
  const accountChainType = config.chainType as ChainType
  const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(messageData))
  const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`
  let sig = ''
  checkSignConfig(accountChainType, config)

  if (config.isSmartAccount ?? false) {
    sig = await smartAccountLib.signRegisterAsync(Boolean(config.debug), Boolean(config.isSmartAccount), from, personalMsgHex)
  } else if ([
    ChainType.ethereum,
    ChainType.moon,
    ChainType.conflux,
    ChainType.bsc,
    ChainType.platon
  ].includes(accountChainType)) {
    sig = await ethereumLib.signMessageAsync(Boolean(config.debug), config.ethConnectedSigner as Signer, from, messageData)
    sig = `${sig},,ECDSA`
  } else if (accountChainType === ChainType.arweave) {
    sig = await arweaveLib.signMessageAsync(Boolean(config.debug), config.arJWK as ArJWK, from, messageData)
    sig = `${sig},RSA`
  } else {
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
  }
  return { everHash: personalMsgHex, sig }
}

export const signMessageAsync = async (config: Config, messageData: string, accountData?: any): Promise<SignMessageAsyncResult> => {
  const from = config.account as string
  const accountChainType = config.chainType as ChainType
  const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(messageData))
  const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`
  let sig = ''
  checkSignConfig(accountChainType, config)

  if (!isNodeJs() && Boolean(config.isSmartAccount) && !window.location.host.includes('everpay.io')) {
    const url = `https://beta${(config.debug ?? false) ? '-dev' : ''}.everpay.io/sign?account=${config.account as string}&message=${encodeURIComponent(messageData)}&host=${encodeURIComponent(window.location.host)}`
    // const url = `http://localhost:8080/sign?account=${config.account as string}&message=${encodeURIComponent(messageData)}`
    const popup = openPopup(url)
    sig = await runPopup({
      popup,
      type: 'sign'
    })
  } else {
    if (config.isSmartAccount ?? false) {
      sig = await smartAccountLib.signMessageAsync(Boolean(config.debug), Boolean(config.isSmartAccount), from, personalMsgHex, accountData)
    } else if ([
      ChainType.ethereum,
      ChainType.moon,
      ChainType.conflux,
      ChainType.bsc,
      ChainType.platon
    ].includes(accountChainType)) {
      sig = await ethereumLib.signMessageAsync(Boolean(config.debug), config.ethConnectedSigner as Signer, from, messageData)
    } else if (accountChainType === ChainType.arweave) {
      sig = await arweaveLib.signMessageAsync(Boolean(config.debug), config.arJWK as ArJWK, from, messageData)
    } else {
      throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
    }
  }
  return { everHash: personalMsgHex, sig }
}

export const getRedPackTxMessage = (redPackTxSig: CliamParams): string => {
  const keys = [
    'redpacketUUID',
    'claimBy',
    'salt',
    'createdAt'
  ] as const
  return keys.map(key => `${key}:${redPackTxSig[key]}`).join('\n')
}

export const transferAsync = async (
  config: Config,
  info: EverpayInfo,
  params: TransferAsyncParams
): Promise<EthereumTransaction | ArweaveTransaction> => {
  checkSignConfig(config.chainType as ChainType, config)

  const to = getDepositAddr(info, config.chainType as ChainType)
  const paramsMergedTo = { ...params, to }

  if ([
    ChainType.ethereum,
    ChainType.moon,
    ChainType.conflux,
    ChainType.bsc,
    ChainType.platon
  ].includes(config.chainType as ChainType)) {
    return await ethereumLib.transferAsync(config.ethConnectedSigner as Signer, config.chainType as ChainType, paramsMergedTo)
  } else if (config.chainType as ChainType === ChainType.arweave) {
    return await arweaveLib.transferAsync(config.arJWK as ArJWK, config.chainType as ChainType, paramsMergedTo)
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}
