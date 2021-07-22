import { Contract, Signer, utils, providers } from 'ethers'
import { TransferAsyncParams } from './interface'
import erc20Abi from '../constants/abi/erc20'
import { getTokenAddrByChainType } from '../utils/util'
import { ChainType, EthereumTransaction } from '../types'

const getEverpayTxDataFieldAsync = async (data?: Record<string, unknown>): Promise<string> => {
  return data !== undefined ? JSON.stringify(data) : ''
}

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

  // TODO: check balance
  if (symbol.toLowerCase() === 'eth') {
    const transactionRequest = {
      from: from.toLowerCase(),
      to: to?.toLowerCase(),
      value
    }
    transactionResponse = await ethConnectedSigner.sendTransaction(transactionRequest)
  } else {
    const tokenID = getTokenAddrByChainType(token, ChainType.ethereum)
    const erc20RW = new Contract(tokenID.toLowerCase(), erc20Abi, ethConnectedSigner)
    transactionResponse = await erc20RW.transfer(to, value)
  }
  return transactionResponse
}

export default {
  getEverpayTxDataFieldAsync,
  signMessageAsync,
  transferAsync
}
