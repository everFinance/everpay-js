import Arweave from 'arweave'
import { TransferAsyncParams } from './interface'
import { ChainType } from '../types'
import { ERRORS } from '../utils/errors'
import { getAccountData } from '../api'
import { getEverpayHost } from '../config'
import { genEverId, getUserId } from '../utils/util'

const getRpId = (): string => {
  const domain = document.domain
  if (domain === 'localhost') {
    return domain
  }
  if (domain.includes('everpay.io')) {
    return 'everpay.io'
  }
  return domain
}

const signRegisterAsync = async (debug: boolean, isSmartAccount: boolean, email: string, everHash: string): Promise<string> => {
  const everId = genEverId(email)
  const userId = getUserId(debug, everId)
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: {
        name: 'everpay',
        id: getRpId()
      },
      user: {
        name: email,
        displayName: email,
        id: Arweave.utils.b64UrlToBuffer(userId)
      },
      challenge: Arweave.utils.b64UrlToBuffer(window.btoa(everHash)),
      attestation: 'direct',
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7
        },
        {
          type: 'public-key',
          alg: -257
        }
      ],
      timeout: 300000,
      authenticatorSelection: {
        requireResidentKey: false,
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    }
  }) as any

  console.log(credential, 'credential')
  if (credential === null) {
    throw new Error('cancelled')
  }
  const sigJson = {
    id: credential.id,
    rawId: Arweave.utils.bufferTob64Url(credential.rawId),
    attestationObject: Arweave.utils.bufferTob64Url(credential.response.attestationObject),
    clientDataJSON: Arweave.utils.bufferTob64Url(credential.response.clientDataJSON),
    userId
  }
  const signResult = window.btoa(JSON.stringify(sigJson))

  return `${signResult},,FIDO2`
}

const signMessageAsync = async (debug: boolean, isSmartAccount: boolean, email: string, everHash: string, accountData?: any): Promise<string> => {
  if (accountData == null) {
    const everpayHost = getEverpayHost(debug)
    const everId = genEverId(email)
    accountData = await getAccountData(everpayHost, everId)
  }
  const arr = Object.entries(accountData.publicValues)[0] as string[]
  const id = arr[0]
  const publicValue = arr[1]
  const publicKeyData = {
    allowCredentials: [
      {
        type: 'public-key',
        id: Arweave.utils.b64UrlToBuffer(id),
        transports: [
          'internal',
          'usb',
          'nfc',
          'ble'
        ]
      }
    ]
  }
  const assertion = await navigator.credentials.get({
    publicKey: {
      ...publicKeyData,
      challenge: Arweave.utils.b64UrlToBuffer(window.btoa(everHash)),
      rpId: getRpId()
    } as any
  }) as any
  console.log(assertion, 'assertion')
  if (assertion === null) {
    throw new Error('cancelled')
  }
  const authenticatorData = assertion.response.authenticatorData
  const clientDataJSON = assertion.response.clientDataJSON
  const rawId = assertion.rawId
  const signature = assertion.response.signature
  const userHandle = assertion.response.userHandle
  const sigJson = {
    id: assertion?.id,
    rawId: Arweave.utils.bufferTob64Url(rawId),
    clientDataJSON: Arweave.utils.bufferTob64Url(clientDataJSON),
    authenticatorData: Arweave.utils.bufferTob64Url(authenticatorData),
    signature: Arweave.utils.bufferTob64Url(signature),
    userHandle: Arweave.utils.bufferTob64Url(userHandle)
  }
  const sig = window.btoa(JSON.stringify(sigJson))
  return `${sig},${publicValue},FIDO2`
}

const transferAsync = async (isSmartAccount: boolean, chainType: ChainType, {
  symbol,
  token,
  from,
  to,
  value
}: TransferAsyncParams): Promise<any> => {
  throw new Error(ERRORS.SMART_ACCOUNT_DEPOSIT_NOT_SUPPORT)
}

export default {
  signRegisterAsync,
  signMessageAsync,
  transferAsync
}
