import { Contract, Signer, utils, providers } from 'ethers'
import { TransferAsyncParams } from './interface'
import erc20Abi from '../constants/abi/erc20'
import { getTokenAddrByChainType } from '../utils/util'
import { ChainType, EthereumTransaction } from '../types'
import { NATIVE_CHAIN_TOKENS } from '../constants'

// 参考自 zkSync
// https://github.com/WalletConnect/walletconnect-monorepo/issues/347#issuecomment-880553018
const signMessageAsync = async (ethConnectedSigner: Signer, address: string, message: string): Promise<string> => {
  const messageBytes = utils.toUtf8Bytes(message)
  if (ethConnectedSigner instanceof providers.JsonRpcSigner) {
    try {
      const signature = await ethConnectedSigner.provider.send('personal_sign', [
        utils.hexlify(messageBytes),
        address.toLowerCase()
      ])
      return signature
    } catch (e) {
      const noPersonalSign: boolean = e.message.includes('personal_sign')
      if (noPersonalSign) {
        return await ethConnectedSigner.signMessage(messageBytes)
      }
      throw e
    }
  } else {
    return await ethConnectedSigner.signMessage(messageBytes)
  }
}

const transferAsync = async (ethConnectedSigner: Signer, {
  symbol,
  token,
  from,
  to,
  value
}: TransferAsyncParams): Promise<EthereumTransaction> => {
  let transactionResponse: EthereumTransaction
  const nativeToken = NATIVE_CHAIN_TOKENS.find(t => {
    const signerNetwork = (ethConnectedSigner.provider as any)._network
    return +t.chainId === +signerNetwork.chainId && t.network === signerNetwork.name
  })

  // TODO: check balance
  if (symbol.toLowerCase() === nativeToken?.nativeSymbol) {
    const transactionRequest = {
      from: from.toLowerCase(),
      to: to?.toLowerCase(),
      gasLimit: 25000,
      value
    }
    transactionResponse = await ethConnectedSigner.sendTransaction(transactionRequest)
  } else {
    const tokenID = getTokenAddrByChainType(token, nativeToken?.chainType as ChainType)
    const erc20RW = new Contract(tokenID.toLowerCase(), erc20Abi, ethConnectedSigner)
    transactionResponse = await erc20RW.transfer(to, value, {
      gasLimit: 100000
    })
  }
  return transactionResponse
}

export default {
  signMessageAsync,
  transferAsync
}
