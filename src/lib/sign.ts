import { SignMessageAsyncResult, TransferAsyncParams } from './interface'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import { ArJWK, ChainType, Config, EverpayInfo, EverpayTxWithoutSig, EthereumTransaction, ArweaveTransaction } from '../types'
import { checkSignConfig } from '../utils/check'
import { Signer } from '@ethersproject/abstract-signer'
import { ERRORS } from '../utils/errors'
import { getAccountChainType } from '../utils/util'
import hashPersonalMessage from './hashPersonalMessage'

const getDepositAddr = (info: EverpayInfo, accountChainType: ChainType): string => {
  if (accountChainType === ChainType.ethereum) {
    return info?.ethLocker
  } else if (accountChainType === ChainType.arweave) {
    // AR 大小写敏感
    return info?.arLocker
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
  const accountChainType = getAccountChainType(from)
  const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(messageData))
  const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`
  let sig = ''
  checkSignConfig(accountChainType, config)

  if (accountChainType === ChainType.ethereum) {
    sig = await ethereumLib.signMessageAsync(config.ethConnectedSigner as Signer, from, messageData)
  } else if (accountChainType === ChainType.arweave) {
    sig = await arweaveLib.signMessageAsync(config.arJWK as ArJWK, from, personalMsgHex)
  } else {
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
  }
  return { everHash: personalMsgHex, sig }
}

export const transferAsync = async (
  config: Config,
  info: EverpayInfo,
  params: TransferAsyncParams
): Promise<EthereumTransaction | ArweaveTransaction> => {
  const accountChainType = getAccountChainType(params.from)
  checkSignConfig(accountChainType, config)

  const to = getDepositAddr(info, accountChainType)
  const paramsMergedTo = { ...params, to }

  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.transferAsync(config.ethConnectedSigner as Signer, paramsMergedTo)
  } else if (accountChainType === ChainType.arweave) {
    return await arweaveLib.transferAsync(config.arJWK as ArJWK, paramsMergedTo)
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}
