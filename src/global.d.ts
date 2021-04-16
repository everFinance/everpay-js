/* eslint-disable */
type fn = (...args: any[]) => any

type ChainType = 'ethereum'

interface Config {
  debug?: boolean
  account: string
}

interface Token {
  id: string
  symbol: string
  decimals: number
  totalSupply: number
  chainType: ChainType
}

interface EverpayInfo {
  ethLocker: string
  owner: string
  tokenList: Token[]
}