import { isAddress } from '@ethersproject/address'
import isString from 'lodash/isString'
import { v4 as uuidv4 } from 'uuid'
import BN from 'bignumber.js'
import { ERRORS } from './errors'
import { BundleData, ChainType, InternalTransferItem, Token, FeeItem } from '../types'
import { bundleInternalTxVersion } from '../config'
import sha256 from 'crypto-js/sha256'
import encHex from 'crypto-js/enc-hex'

BN.config({
  EXPONENTIAL_AT: 1000,
})

export const toBN = (x: number | string | BN): BN => {
  if (isNaN(Number(x))) return new BN(0)
  if (x instanceof BN) return x

  if (typeof x === 'string') {
    if (x.indexOf('0x') === 0 || x.indexOf('-0x') === 0) {
      return new BN((x).replace('0x', ''), 16)
    }
  }
  return new BN(x)
}

export const fromUnitToDecimalBN = (x: number | string | BN, decimals: number): BN => {
  return toBN(x).times(toBN(10).pow(decimals))
}

export const fromUnitToDecimal = (x: number | string | BN, decimals: number): string => {
  return fromUnitToDecimalBN(x, decimals).toString()
}

export const fromDecimalToUnitBN = (x: number | string | BN, decimals: number): BN => {
  return toBN(x).dividedBy(toBN(10).pow(decimals))
}

export const fromDecimalToUnit = (x: number | string | BN, decimals: number): string => {
  return fromDecimalToUnitBN(x, decimals).toString()
}

export const getTimestamp = (): number => Math.round(Date.now() / 1000)

export const getTokenByTag = (tag: string, tokenList?: Token[]): Token | undefined => {
  return tokenList?.find(t => matchTokenTag(genTokenTag(t), tag))
}

export const isEthereumAddress = isAddress

export const isArweaveAddress = (address: string): boolean => {
  return isString(address) && address.length === 43 && address.search(/[a-z0-9A-Z_-]{43}/g) === 0
}

export const isArweaveChainPSTMode = (token?: Token): boolean => {
  if (token == null) return false
  return token.crossChainInfoList[ChainType.arweave] != null && token.symbol.toUpperCase() !== 'AR'
}

export const isArweaveL2PSTTokenSymbol = (symbol: string): boolean => {
  return ['STAMP', 'U'].includes(symbol?.toUpperCase())
}

export const isArweaveAOSTestTokenSymbol = (symbol: string): boolean => {
  return ['AOCRED', '0RBT', 'TRUNK'].includes(symbol?.toUpperCase())
}

export const isPermaswapHaloTokenSymbol = (symbol: string): boolean => {
  return symbol?.toUpperCase() === 'HALO'
}

export const getAccountChainType = (from: string): ChainType => {
  if (isEthereumAddress(from)) {
    return ChainType.ethereum
  }

  if (isArweaveAddress(from)) {
    return ChainType.arweave
  }

  throw new Error(ERRORS.INVALID_ACCOUNT_TYPE)
}

export const getTokenAddrByChainType = (token: Token, chainType: ChainType): string => {
  const crossChainInfo = token.crossChainInfoList[chainType]
  return crossChainInfo.targetTokenId
}

export const getChainDecimalByChainType = (token: Token, chainType: ChainType): number => {
  const crossChainInfo = token.crossChainInfoList[chainType]
  return crossChainInfo.targetDecimals
}

export const getTokenBurnFeeByChainType = (token: Token, feeItem: FeeItem, chainType: ChainType): string => {
  return feeItem.burnFeeMap[chainType]
}

export const genTokenTag = (token: Token): string => {
  const { chainType, symbol, id } = token
  const chainTypes = chainType.split(',')
  const tokenAddrs = id.split(',').map((addr: string, index: number) => {
    if ([
      ChainType.ethereum,
      ChainType.bsc,
      ChainType.conflux,
      ChainType.moon,
      ChainType.platon,
      'everpay'
    ].includes(chainTypes[index] as ChainType)) {
      return addr.toLowerCase()
    }
    return addr
  })
  return `${chainType.toLowerCase()}-${symbol.toLowerCase()}-${tokenAddrs.join(',')}`
}

export const matchTokenTag = (tag1: string, tag2: string): boolean => {
  return tag1?.toLowerCase() === tag2?.toLowerCase()
}

interface GenExpressDataParams {
  chainType: ChainType
  to: string
  fee: string
}
interface ExpressData {
  appId: 'express'
  withdrawAction: 'pay'
  withdrawTo: string
  withdrawChainType: ChainType
  withdrawFee: string
}

export const genExpressData = (params: GenExpressDataParams): ExpressData => {
  const { chainType, to, fee } = params
  return {
    appId: 'express',
    withdrawAction: 'pay',
    withdrawTo: to,
    withdrawChainType: chainType,
    withdrawFee: fee
  }
}

interface GenBundleDataParams {
  tokenList: Token[]
  items: InternalTransferItem[]
  data?: string
  expiration: number
}

export const genBundleData = (params: GenBundleDataParams): BundleData => {
  const items = params.items.map((item: InternalTransferItem) => {
    const { tag, amount, from, to, data } = item
    const token = getTokenByTag(tag, params.tokenList) as Token
    // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
    return {
      tag: genTokenTag(token),
      chainID: token.chainID,
      from,
      to,
      data: data != null ? data : '',
      amount: fromUnitToDecimal(amount, token.decimals)
    }
  })
  const salt = uuidv4()
  const version = bundleInternalTxVersion
  return {
    // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
    items,
    expiration: params.expiration,
    salt,
    version,
    data: params.data != null ? params.data : ''
  }
}

export const isSmartAccount = (account: string): boolean => {
  return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(account)
}

export const getUserId = (debug: boolean, everId: string): string => {
  const everpayChainIdStr = debug ? '5' : '1'
  // hash the message
  const hash = sha256(`${everId.trim().toLowerCase()}${everpayChainIdStr}`)
  const arrBuffer = hexToUint8Array(hash.toString()).slice(0, 10)
  const b64encoded = window.btoa(String.fromCharCode.apply(null, arrBuffer as any))
  return b64encoded
}

const checkSum = (idBytes: Uint8Array): Uint8Array => {
  const hash = sha256(encHex.parse(uint8ArrayToHex(Uint8Array.from([...Buffer.from('eid'), ...idBytes]))))
  return hexToUint8Array(hash.toString()).slice(0, 2)
}

export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return [...uint8Array].map((b) => {
    return b.toString(16).padStart(2, '0')
  }).join('')
}

export const hexToUint8Array = (hexString: string): Uint8Array =>
  Uint8Array.from((hexString.match(/.{1,2}/g) as any).map((byte: any) => parseInt(byte, 16)))

export const genEverId = (email: string): string => {
  const str = email.toLowerCase().trim()
  const hash = sha256(str)
  const idBytes = hexToUint8Array(hash.toString())
  const sum = checkSum(idBytes)
  const concatArray = Uint8Array.from([...idBytes, ...sum])
  return `eid${uint8ArrayToHex(concatArray)}`
}

export const isNodeJs = (): boolean =>
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null

const mobileRE = /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|ipad|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i

const tabletRE = /android|ipad|playbook|silk/i

export const isMobileDevice = (opts?: any): boolean => {
  if (opts == null) opts = {}
  let ua = opts.ua
  if (ua == null && typeof navigator !== 'undefined') ua = navigator.userAgent
  if (ua?.headers != null && typeof ua.headers['user-agent'] === 'string') {
    ua = ua.headers['user-agent']
  }
  if (typeof ua !== 'string') return false

  let result = mobileRE.test(ua) || (opts?.tablet != null && tabletRE.test(ua))

  if (
    !result &&
      opts?.tablet != null &&
      opts?.featureDetect != null &&
      navigator?.maxTouchPoints > 1 &&
      ua.includes('Macintosh') &&
      ua.includes('Safari')
  ) {
    result = true
  }

  return result
}

export const isMobile = isMobileDevice({
  tablet: true,
  featureDetect: true
})