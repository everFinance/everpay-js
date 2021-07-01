import Arweave from 'arweave'
// TODO: node
import { bufferTob64Url } from 'arweave/web/lib/utils'
import { isString } from 'lodash-es'
import { ArJWK, ArweaveTransaction } from '../global'
import { TransferAsyncParams } from './interface'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

// TODO: to fix arConnect return result and interface
enum ERRORS {
  PLEASE_INSTALL_ARCONNECT = 'PLEASE_INSTALL_ARCONNECT',
  ACCESS_ADDRESS_PERMISSION_NEEDED = 'ACCESS_ADDRESS_PERMISSION_NEEDED',
  ACCESS_PUBLIC_KEY_PERMISSION_NEEDED = 'ACCESS_PUBLIC_KEY_PERMISSION_NEEDED',
  SIGNATURE_PERMISSION_NEEDED = 'NEED_SIGNATURE_PERMISSION',
  SIGN_TRANSACTION_PERMISSION_NEEDED = 'SIGN_TRANSACTION_PERMISSION_NEEDED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  TRANSACTION_POST_ERROR = 'TRANSACTION_POST_ERROR',
  ACCESS_PUBLIC_KEY_FAILED = 'ACCESS_PUBLIC_KEY_FAILED'
}

export const checkArPermissions = async (permissions: string[] | string): Promise<void> => {
  let existingPermissions: string[] = []
  permissions = isString(permissions) ? [permissions] : permissions

  try {
    existingPermissions = await window.arweaveWallet.getPermissions()
  } catch {
    throw new Error(ERRORS.PLEASE_INSTALL_ARCONNECT)
  }

  if (permissions.length === 0) {
    return
  }

  if (permissions.some(permission => {
    return !existingPermissions.includes(permission)
  })) {
    await window.arweaveWallet.connect(permissions as never[])
  }
}

const getEverpayTxDataFieldAsync = async (arJWK: ArJWK, data?: Record<string, unknown>): Promise<string> => {
  let arOwner = ''
  if (arJWK === 'use_wallet') {
    try {
      await checkArPermissions('ACCESS_PUBLIC_KEY')
    } catch {
      throw new Error(ERRORS.ACCESS_PUBLIC_KEY_PERMISSION_NEEDED)
    }
    try {
      arOwner = await window.arweaveWallet.getActivePublicKey()
    } catch {
      throw new Error(ERRORS.ACCESS_PUBLIC_KEY_FAILED)
    }
  } else if (arJWK !== undefined) {
    arOwner = arJWK.n
  }
  return JSON.stringify(data !== undefined ? { ...data, arOwner } : { arOwner })
}

const signMessageAsync = async (arJWK: ArJWK, personalMsgHash: Buffer): Promise<string> => {
  const arweave = Arweave.init(options)
  // web
  if (arJWK === 'use_wallet') {
    try {
      await checkArPermissions('SIGNATURE')
    } catch {
      throw new Error(ERRORS.SIGNATURE_PERMISSION_NEEDED)
    }

    const algorithm = {
      name: 'RSA-PSS',
      saltLength: 0
    }

    try {
      // eslint-disable-next-line
      const signature = await window.arweaveWallet.signature(
        personalMsgHash,
        algorithm
      )
      const buf = new Uint8Array(Object.values(signature))
      return bufferTob64Url(buf)
    } catch {
      throw new Error(ERRORS.SIGNATURE_FAILED)
    }

  // node
  } else {
    const buf = await arweave.crypto.sign(arJWK, personalMsgHash)
    return bufferTob64Url(buf)
  }
}

const transferAsync = async (arJWK: ArJWK, {
  to,
  value
}: TransferAsyncParams): Promise<ArweaveTransaction> => {
  const arweave = Arweave.init(options)
  const transactionTransfer = await arweave.createTransaction({
    target: to,
    quantity: value.toString()
  }, arJWK)
  // 直接给原来 transaction 赋值了 signature 值
  await arweave.transactions.sign(transactionTransfer, arJWK)
  const responseTransfer = await arweave.transactions.post(transactionTransfer)
  if (responseTransfer.status === 200) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (responseTransfer.data.error) {
      throw new Error(responseTransfer.data.error)
    }
    return transactionTransfer
  }
  throw new Error(ERRORS.TRANSACTION_POST_ERROR)
}

export default {
  getEverpayTxDataFieldAsync,
  signMessageAsync,
  transferAsync
}
