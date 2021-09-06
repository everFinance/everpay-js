import { isAddress } from '@ethersproject/address'
import { isString } from 'lodash-es'
import BN from 'bignumber.js'
import { ERRORS } from './errors'
import { ChainType, Token } from '../types'

BN.config({
  EXPONENTIAL_AT: 1000
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

export const getTokenBySymbol = (symbol: string, tokenList?: Token[]): Token | undefined => {
  return tokenList?.find(t => t.symbol.toUpperCase() === symbol.toUpperCase())
}

const isEthereumAddress = isAddress

const isArweaveAddress = (address: string): boolean => {
  return isString(address) && address.length === 43 && address.search(/[a-z0-9A-Z_-]{43}/g) === 0
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
  const chainTypes = token.chainType.split(',') as ChainType[]
  const tokenAddrs = token.id.split(',')
  const index = chainTypes.findIndex(c => c === chainType)
  if (index === -1) {
    throw new Error(ERRORS.TOKEN_NOT_FOUND)
  }
  return tokenAddrs[index]
}

export const getTokenBurnFeeByChainType = (token: Token, chainType: ChainType): string => {
  const chainTypes = token.chainType.split(',') as ChainType[]
  const tokenBurnFees = token.burnFee.split(',')
  const index = chainTypes.findIndex(c => c === chainType)
  if (index === -1) {
    throw new Error(ERRORS.TOKEN_NOT_FOUND)
  }
  return tokenBurnFees[index] !== undefined ? tokenBurnFees[index] : token.burnFee
}

export const genTokenTag = (token: Token): string => {
  const { chainType, symbol, id } = token
  const chainTypes = chainType.split(',')
  const tokenAddrs = id.split(',').map((addr: string, index: number) => {
    if (chainTypes[index] === ChainType.ethereum) {
      return addr.toLowerCase()
    }
    return addr
  })
  return `${chainType.toLowerCase()}-${symbol.toLowerCase()}-${tokenAddrs.join(',')}`
}

export const matchTokenTag = (tag1: string, tag2: string): boolean => {
  return tag1.toLowerCase() === tag2.toLowerCase()
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
