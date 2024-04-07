import Arweave from 'arweave'
import isString from 'lodash/isString'
import { ArJWK, ArweaveTransaction, ChainType } from '../types'
import { getTokenAddrByChainType, hexToUint8Array, isArweaveAOSTestTokenSymbol, isArweaveL2PSTTokenSymbol } from '../utils/util'
import { TransferAsyncParams } from './interface'
import { sendRequest } from '../api'
import sha256 from 'crypto-js/sha256'
import { connect } from '@permaweb/aoconnect'

import { createData } from 'arseeding-arbundles'
import { InjectedArweaveSigner } from 'arseeding-arbundles/src/signing'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const defaultAOConfig = {
  CU_URL: 'https://cu.ao-testnet.xyz',
  MU_URL: 'https://mu.ao-testnet.xyz',
  GATEWAY_URL: 'https://g8way.io:443'
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

const signMessageAsync = async (debug: boolean, arJWK: ArJWK, address: string, messageData: string): Promise<string> => {
  const arweave = Arweave.init(options)
  const msgDataBuffer = Buffer.from(messageData, 'utf-8')
  let arOwner = ''
  let signatureB64url = ''
  // web
  if (arJWK === 'use_wallet') {
    try {
      await checkArPermissions('ACCESS_PUBLIC_KEY')
    } catch {
      throw new Error(ERRORS.ACCESS_PUBLIC_KEY_PERMISSION_NEEDED)
    }
    try {
      // TODO: wait arweave-js update arconnect.d.ts
      arOwner = await (window.arweaveWallet).getActivePublicKey()
    } catch {
      throw new Error(ERRORS.ACCESS_PUBLIC_KEY_FAILED)
    }

    try {
      await checkArPermissions('SIGNATURE')
    } catch {
      throw new Error(ERRORS.SIGNATURE_PERMISSION_NEEDED)
    }

    const algorithm = {
      name: 'RSA-PSS',
      saltLength: 32
    }

    if ((window.arweaveWallet as any).signMessage !== undefined) {
      try {
        const signature = await (window.arweaveWallet as any).signMessage(
          msgDataBuffer,
          { hashAlgorithm: 'SHA-256' }
        )
        const buf = new Uint8Array(Object.values(signature))
        signatureB64url = Arweave.utils.bufferTob64Url(buf)
      } catch {
        throw new Error(ERRORS.SIGNATURE_FAILED)
      }
    } else {
      try {
        const hash = sha256(messageData)
        const signature = await (window.arweaveWallet).signature(
          hexToUint8Array(hash.toString()),
          algorithm
        )
        const buf = new Uint8Array(Object.values(signature))
        signatureB64url = Arweave.utils.bufferTob64Url(buf)
      } catch {
        throw new Error(ERRORS.SIGNATURE_FAILED)
      }
    }

  // node
  } else {
    const hash = sha256(messageData)
    const buf = await arweave.crypto.sign(arJWK, hexToUint8Array(hash.toString()), {
      saltLength: 32
    })
    arOwner = arJWK.n
    signatureB64url = Arweave.utils.bufferTob64Url(buf)
  }

  return `${signatureB64url},${arOwner}`
}

// TODO: only support browser yet
export const sendAoTransfer = async (
  process: string,
  recipient: string,
  amount: string
) => {
  const ao = connect(defaultAOConfig)

  try {
    const createDataItemSigner =
      () =>
        async ({
          data,
          tags = [],
          target,
          anchor
        }: {
          data: any
          tags?: Array<{ name: string, value: string }>
          target?: string
          anchor?: string
        }): Promise<{ id: string, raw: ArrayBuffer }> => {
          await checkArPermissions([
            'ACCESS_ADDRESS',
            'ACCESS_ALL_ADDRESSES',
            'ACCESS_PUBLIC_KEY',
            'SIGN_TRANSACTION',
            'SIGNATURE'
          ])
          const signer = new InjectedArweaveSigner(window.arweaveWallet)
          await signer.setPublicKey()
          const dataItem = createData(data, signer, { tags, target, anchor })

          await dataItem.sign(signer)

          return {
            id: dataItem.id,
            raw: dataItem.getRaw()
          }
        }
    const signer = createDataItemSigner() as any
    const transferID = await ao.message({
      process,
      signer,
      tags: [
        { name: 'Action', value: 'Transfer' },
        {
          name: 'Recipient',
          value: recipient
        },
        { name: 'Quantity', value: amount }
      ]
    })
    return transferID
  } catch (err) {
    console.log('err', err)
    throw err
  }
}

const transferAsync = async (arJWK: ArJWK, chainType: ChainType, {
  symbol,
  token,
  from,
  to,
  value
}: TransferAsyncParams): Promise<ArweaveTransaction> => {
  const arweave = Arweave.init(options)
  let transactionTransfer: any

  if (isArweaveAOSTestTokenSymbol(token.symbol)) {
    const tokenID = getTokenAddrByChainType(token, ChainType.aostest)
    const transferID = await sendAoTransfer(tokenID, to as string, value.toString())
    console.log('transferID', transferID)
    return {
      id: transferID,
      status: 200,
      data: {}
    } as any
  }

  if (symbol.toUpperCase() === 'AR') {
    transactionTransfer = await arweave.createTransaction({
      target: to,
      quantity: value.toString()
    }, arJWK)

  // PST Token
  } else {
    const tokenID = getTokenAddrByChainType(token, ChainType.arweave)
    transactionTransfer = await arweave.createTransaction({
      data: (Math.random() * 10000).toFixed(),
      last_tx: isArweaveL2PSTTokenSymbol(token.symbol) ? 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO' : undefined,
      reward: isArweaveL2PSTTokenSymbol(token.symbol) ? '0' : undefined
    }, arJWK)
    transactionTransfer.addTag('App-Name', 'SmartWeaveAction')
    transactionTransfer.addTag('App-Version', '0.3.0')
    transactionTransfer.addTag('Contract', tokenID)
    transactionTransfer.addTag('Input', JSON.stringify({
      function: 'transfer',
      qty: value.toNumber(),
      target: to
    }))
  }

  if (arJWK === 'use_wallet') {
    try {
      const existingPermissions = await window.arweaveWallet.getPermissions() as string[]
      if (!existingPermissions.includes('SIGN_TRANSACTION')) {
        await window.arweaveWallet.connect(['SIGN_TRANSACTION'])
      }
    } catch (_a) {
      // Permission is already granted
    }
    const signedTransaction = await window.arweaveWallet.sign(transactionTransfer)
    // TODO: Temp fix arConnect modify reward
    transactionTransfer.reward = signedTransaction.reward
    transactionTransfer.setSignature({
      id: signedTransaction.id,
      owner: signedTransaction.owner,
      tags: signedTransaction.tags,
      signature: signedTransaction.signature
    })
  } else {
    // 直接给原来 transaction 赋值了 signature 值
    await arweave.transactions.sign(transactionTransfer, arJWK)
  }
  let responseTransfer = null as any
  if (isArweaveL2PSTTokenSymbol(token.symbol)) {
    await sendRequest({
      url: 'https://gw.warp.cc/gateway/sequencer/register',
      data: transactionTransfer,
      headers: {
        // 'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      method: 'POST'
    })
    responseTransfer = {
      status: 200,
      data: {}
    }
    // responseTransfer = await fetch('https://gateway.warp.cc/gateway/sequencer/register', {
    //   method: 'POST',
    //   body: JSON.stringify(transactionTransfer),
    //   headers: {
    //     'Accept-Encoding': 'gzip, deflate, br',
    //     'Content-Type': 'application/json',
    //     Accept: 'application/json'
    //   }
    // })
  } else {
    responseTransfer = await arweave.transactions.post(transactionTransfer)
  }

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
  signMessageAsync,
  transferAsync
}
