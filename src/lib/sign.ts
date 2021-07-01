import { SignMessageAsyncResult, TransferAsyncParams } from './interface'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import { ArJWK, ChainType, Config, EverpayInfo, EverpayTxWithoutSig, EthereumTransaction, ArweaveTransaction } from '../global'
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

export const getEverpayTxDataField = async (
  config: Config,
  accountChainType: ChainType,
  data?: Record<string, unknown>
): Promise<string> => {
  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.getEverpayTxDataFieldAsync(data)
  } else if (accountChainType === ChainType.arweave) {
    return await arweaveLib.getEverpayTxDataFieldAsync(config.arJWK as ArJWK, data)
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

export const signMessageAsync = async (config: Config, everpayTxWithoutSig: EverpayTxWithoutSig): Promise<SignMessageAsyncResult> => {
  const accountChainType = getAccountChainType(everpayTxWithoutSig.from)
  const message = getEverpayTxMessage(everpayTxWithoutSig)
  const personalMsgHash = hashPersonalMessage(Buffer.from(message))
  const everHash = `0x${personalMsgHash.toString('hex')}`
  let sig = ''
  checkSignConfig(accountChainType, config)

  if (accountChainType === ChainType.ethereum) {
    sig = await ethereumLib.signMessageAsync(config.ethConnectedSigner as Signer, message)
  } else if (accountChainType === ChainType.arweave) {
    sig = await arweaveLib.signMessageAsync(config.arJWK as ArJWK, personalMsgHash)
  } else {
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
  }
  return { everHash, sig }
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
