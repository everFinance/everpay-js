import Arweave from 'arweave'
import { ArTransferResult, TransferAsyncParams } from './interface'
import { JWKInterface } from 'arweave/node/lib/wallet'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const signMessageAsync = async (arJWK: JWKInterface, personalMsgMash: Buffer): Promise<string> => {
  const arweave = Arweave.init(options)
  const buf = await arweave.crypto.sign(arJWK, personalMsgMash)
  return Buffer.from(buf).toString('base64')
}

const transferAsync = async (arJWK: JWKInterface, {
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
