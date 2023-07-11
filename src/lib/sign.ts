import { SignMessageAsyncResult, TransferAsyncParams } from './interface'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import { ArJWK, ChainType, Config, EverpayInfo, EverpayTxWithoutSig, EthereumTransaction, ArweaveTransaction, EverpayTransaction } from '../types'
import { checkSignConfig } from '../utils/check'
import { Signer } from '@ethersproject/abstract-signer'
import { ERRORS } from '../utils/errors'
import hashPersonalMessage from './hashPersonalMessage'
import { getAccountChainType } from '../utils/util'

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

export const signMessageAsync = async (config: Config, messageData: string): Promise<SignMessageAsyncResult> => {
  const from = config.account as string
  const accountChainType = config.chainType as ChainType
  const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(messageData))
  const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`
  let sig = ''
  checkSignConfig(accountChainType, config)

  if ([
    ChainType.ethereum,
    ChainType.moon,
    ChainType.conflux,
    ChainType.bsc,
    ChainType.platon
  ].includes(accountChainType)) {
    sig = await ethereumLib.signMessageAsync(config.ethConnectedSigner as Signer, from, messageData)
  } else if (accountChainType === ChainType.arweave) {
    sig = await arweaveLib.signMessageAsync(config.arJWK as ArJWK, from, personalMsgHex)
  } else {
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
  }
  return { everHash: personalMsgHex, sig }
}

export const verifySigAsync = async (tx: EverpayTransaction): Promise<boolean> => {
  const from = tx.from
  const chainType = getAccountChainType(from)
  const messageData = getEverpayTxMessage(tx as any)
  if (chainType === ChainType.arweave) {
    return await arweaveLib.verifySigAsync(from, messageData, tx.sig)
  } else {
    return await ethereumLib.verifySigAsync(from, messageData, tx.sig)
  }
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
