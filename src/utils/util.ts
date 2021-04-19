import BN from 'bignumber.js'
import { Token } from '../global'

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

export const getTimestamp = (): number => Math.round(Date.now() / 1000)

export const padLeft = (n: string, width: number, z?: string): string => {
  const nz = z ?? '0'
  const nn = '' + n
  return nn.length >= width ? nn : new Array(width - nn.length + 1).join(nz) + nn
}

export function isHexPrefixed (str: string): boolean {
  return str.slice(0, 2) === '0x'
}

export function addHexPrefix (str: string): string {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str : `0x${str}`
}

export function stripHexPrefix (str: string): string {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

export const getTokenBySymbol = (symbol: string, tokenList?: Token[]): Token => {
  return (tokenList?.find(t => t.symbol.toUpperCase() === symbol.toUpperCase()) ?? {}) as Token
}
