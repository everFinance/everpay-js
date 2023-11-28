import { Contract, Signer, utils, providers } from 'ethers'
import { TransferAsyncParams } from './interface'
import erc20Abi from '../constants/abi/erc20'
import { getTokenAddrByChainType } from '../utils/util'
import { ChainType, EthereumTransaction } from '../types'
import { NATIVE_CHAIN_TOKENS } from '../constants'

// 参考自 zkSync
// https://github.com/WalletConnect/walletconnect-monorepo/issues/347#issuecomment-880553018
const signMessageAsync = async (debug: boolean, ethConnectedSigner: Signer, address: string, message: string): Promise<string> => {
  const messageBytes = utils.toUtf8Bytes(message)
  if (ethConnectedSigner instanceof providers.JsonRpcSigner) {
    try {
      const signature = await ethConnectedSigner.provider.send('personal_sign', [
        utils.hexlify(messageBytes),
        address.toLowerCase()
      ]) as string
      return signature
    } catch (e: any) {
      const noPersonalSign: boolean = e.message.includes('personal_sign')
      if (noPersonalSign) {
        const signature = await ethConnectedSigner.signMessage(messageBytes)
        return signature
      }
      throw e
    }
  } else {
    const signature = await ethConnectedSigner.signMessage(messageBytes)
    return signature
  }
}

const transferAsync = async (ethConnectedSigner: Signer, chainType: ChainType, {
  symbol,
  token,
  from,
  to,
  value
}: TransferAsyncParams): Promise<EthereumTransaction> => {
  let transactionResponse: EthereumTransaction
  const foundNative = NATIVE_CHAIN_TOKENS.find(t => {
    return t.chainType === chainType && t.nativeSymbol === symbol.toLowerCase()
  })

  // TODO: check balance
  if (foundNative != null) {
    const transactionRequest = {
      from: from.toLowerCase(),
      to: to?.toLowerCase(),
      gasLimit: 25000,
      value
    }
    transactionResponse = await ethConnectedSigner.sendTransaction(transactionRequest)
  } else {
    const tokenID = getTokenAddrByChainType(token, chainType)
    const erc20RW = new Contract(tokenID.toLowerCase(), erc20Abi, ethConnectedSigner)
    transactionResponse = await erc20RW.transfer(to, value, {
      gasLimit: 200000
    })
  }
  return transactionResponse
}

export default {
  signMessageAsync,
  transferAsync
}
