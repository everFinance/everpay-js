import Arweave from 'arweave'
// TODO: node
import { bufferTob64Url } from 'arweave/web/lib/utils'
import { ArJWK } from '../global'
import { ArTransferResult, TransferAsyncParams } from './interface'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const signMessageAsync = async (arJWK: ArJWK, personalMsgHash: Buffer): Promise<string> => {
  const arweave = Arweave.init(options)
  // web
  if (arJWK === 'use_wallet') {
    const algorithm = {
      name: 'RSA-PSS',
      saltLength: 0
    }
    // eslint-disable-next-line
    const signature = await window.arweaveWallet.signature(
      personalMsgHash,
      algorithm
    )
    // TODO: to fix arConnect return result and interface
    const buf = new Uint8Array(Object.values(signature))
    return bufferTob64Url(buf)

  // node
  } else {
    const buf = await arweave.crypto.sign(arJWK, personalMsgHash)
    return bufferTob64Url(buf)
  }
}

const transferAsync = async (arJWK: ArJWK, {
  to,
  value
}: TransferAsyncParams): Promise<ArTransferResult> => {
  const arweave = Arweave.init(options)

  const transactionTransfer = await arweave.createTransaction({
    target: to,
    quantity: value.toString()
  }, arJWK)
  // 直接给原来 transaction 赋值了 signature 值
  await arweave.transactions.sign(transactionTransfer, arJWK)
  const responseTransfer = await arweave.transactions.post(transactionTransfer)
  return responseTransfer
}

export default {
  signMessageAsync,
  transferAsync
}
