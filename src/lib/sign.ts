import { TransactionResponse } from '@ethersproject/abstract-provider'
import { hashPersonalMessage } from 'ethereumjs-util'
import { ArTransferResult, SignMessageAsyncResult, TransferAsyncParams } from './interface'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import { ArJWK, ChainType, Config, EverpayInfo, EverpayTxWithoutSig } from '../global'
import { checkSignConfig } from '../utils/check'
import { Signer } from '@ethersproject/abstract-signer'
import { ERRORS } from '../utils/errors'
import { getAccountChainType } from '../utils/util'

export const getChainId = (info: EverpayInfo, chainType: ChainType): string => {
  if (chainType === ChainType.ethereum) {
    return info?.ethChainID.toString() ?? ''
  } else if (chainType === ChainType.arweave) {
    return info?.arChainID.toString() ?? ''
  }
  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

const getDepositAddr = (info: EverpayInfo, accountChainType: ChainType): string => {
  if (accountChainType === ChainType.ethereum) {
    return info?.ethLocker.toLowerCase()
  } else if (accountChainType === ChainType.arweave) {
    // TOD: for test
    return '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM'
  }
  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

export const getEverpayTxDataField = async (config: Config, accountChainType: ChainType): Promise<string> => {
  if (accountChainType === ChainType.ethereum) {
    return ''
  } else if (accountChainType === ChainType.arweave) {
    let arOwner = ''
    if (config?.arJWK === 'use_wallet') {
      arOwner = await window.arweaveWallet.getActivePublicKey()
    } else if (config.arJWK !== undefined) {
      arOwner = config.arJWK.n
    }
    return JSON.stringify({ arOwner })
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
  console.log('everHash', everHash)
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

export const transferAsync = async (config: Config, info: EverpayInfo, params: TransferAsyncParams): Promise<TransactionResponse | ArTransferResult> => {
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
