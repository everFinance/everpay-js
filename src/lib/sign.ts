import { TransactionResponse } from '@ethersproject/abstract-provider'
import { TransferAsyncParams } from './interface'
import { isAddress } from '@ethersproject/address'
import ethereumLib from './ethereum'
import { ChainType, Config, EverpayTxWithoutSig } from '../global'
import { checkSignConfig } from '../utils/check'
import { Signer } from '@ethersproject/abstract-signer'

const getAccountChainType = (from: string): ChainType => {
  if (isAddress(from)) {
    return ChainType.ethereum
  }

  // TODO:
  throw new Error('Not supported account')
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
  checkSignConfig(accountChainType, config)

  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.signMessageAsync(config.ethConnectedSigner as Signer, getEverpayTxMessage(everpayTxWithoutSig))
  }

  // TODO:
  throw new Error('Sign Not supported')
}

export const transferAsync = async (config: Config, params: TransferAsyncParams): Promise<TransactionResponse> => {
  const accountChainType = getAccountChainType(params.from)
  checkSignConfig(accountChainType, config)

  if (accountChainType === ChainType.ethereum) {
    return await ethereumLib.transferAsync(config.ethConnectedSigner as Signer, params)
  }

  // TODO:
  throw new Error('Transfer Not supported')
}
