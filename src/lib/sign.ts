import { TransactionResponse } from '@ethersproject/abstract-provider'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { hashPersonalMessage } from 'ethereumjs-util'
import { ArTransferResult, TransferAsyncParams } from './interface'
import { isAddress } from '@ethersproject/address'
import ethereumLib from './ethereum'
import arweaveLib from './arweave'
import { ChainType, Config, EverpayInfo, EverpayTxWithoutSig } from '../global'
import { checkSignConfig } from '../utils/check'
import { Signer } from '@ethersproject/abstract-signer'
import { ERRORS } from '../utils/errors'

const getAccountChainType = (from: string): ChainType => {
  if (isAddress(from)) {
    return ChainType.ethereum
  }

  // TODO: for test
  if (from === '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo'.toLowerCase()) {
    return ChainType.arweave
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

const getDepositAddr = (info: EverpayInfo, accountChainType: ChainType): string => {
  if (accountChainType === ChainType.ethereum) {
    return info?.ethLocker.toLowerCase()
  } else if (accountChainType === ChainType.arweave) {
    // TOD: for test
    return '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM'
    // return info?.arLocker.toLowerCase()
  }
  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

const getEverpayTxMessage = (everpayTxWithoutSig: EverpayTxWithoutSig): string => {
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

export const signMessageAsync = async (config: Config, everpayTxWithoutSig: EverpayTxWithoutSig): Promise<string> => {
  const accountChainType = getAccountChainType(everpayTxWithoutSig.from)
  const message = getEverpayTxMessage(everpayTxWithoutSig)
  const personalMsgMash = hashPersonalMessage(Buffer.from(message))
  console.log(personalMsgMash.toString('hex'))
  checkSignConfig(accountChainType, config)

  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.signMessageAsync(config.ethConnectedSigner as Signer, message)
  } else if (accountChainType === ChainType.arweave) {
    return await arweaveLib.signMessageAsync(config.arJWK as JWKInterface, personalMsgMash)
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

export const transferAsync = async (config: Config, info: EverpayInfo, params: TransferAsyncParams): Promise<TransactionResponse | ArTransferResult> => {
  const accountChainType = getAccountChainType(params.from)
  checkSignConfig(accountChainType, config)

  const to = getDepositAddr(info, accountChainType)
  const paramsMergedTo = { ...params, to }

  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.transferAsync(config.ethConnectedSigner as Signer, paramsMergedTo)
  } else if (accountChainType === ChainType.arweave) {
    return await arweaveLib.transferAsync(config.arJWK as JWKInterface, paramsMergedTo)
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}
