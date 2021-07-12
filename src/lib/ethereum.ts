import { Contract, Signer } from 'ethers'
import { TransferAsyncParams } from './interface'
import erc20Abi from '../constants/abi/erc20'
import { getTokenAddrByChainType } from '../utils/util'
import { ChainType, EthereumTransaction } from '../types'

const getEverpayTxDataFieldAsync = async (data?: Record<string, unknown>): Promise<string> => {
  return data !== undefined ? JSON.stringify(data) : ''
}

const signMessageAsync = async (ethConnectedSigner: Signer, message: string): Promise<string> => {
  return await ethConnectedSigner.signMessage(message)
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
