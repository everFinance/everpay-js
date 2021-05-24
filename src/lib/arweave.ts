import Arweave from 'arweave'
import { ArJWK } from '../global'
import { ArTransferResult, TransferAsyncParams } from './interface'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const ab2Base64 = (buf: Uint8Array): string => {
  const str = String.fromCharCode.apply(null, new Uint8Array(buf) as any)
  return btoa(str)
}

const signMessageAsync = async (arJWK: ArJWK, personalMsgMash: Buffer): Promise<string> => {
  const arweave = Arweave.init(options)
  // web
  if (arJWK === 'use_wallet') {
    const algorithm = {
      name: 'RSA-PSS',
      saltLength: 0
    }
    // eslint-disable-next-line
    const signature = await window.arweaveWallet.signature(
      personalMsgMash,
      algorithm
    )
    // TODO: to fix arConnect return result and interface
    const signatureUnit8Array = new Uint8Array(Object.values(signature))
    const signatureBase64 = ab2Base64(signatureUnit8Array)
    return signatureBase64
  // node
  } else {
    const buf = await arweave.crypto.sign(arJWK, personalMsgMash)
    return Buffer.from(buf).toString('base64')
  }
}

const transferAsync = async (arJWK: ArJWK, {
  to,
  value
}: TransferAsyncParams): Promise<ArTransferResult> => {
  const arweave = Arweave.init(options)

  const transactionTransfer = await arweave.createTransaction({
    target: to,
    quantity: value
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
