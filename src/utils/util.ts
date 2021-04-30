import { Token } from '../global'

export const getTimestamp = (): number => Math.round(Date.now() / 1000)

export const getTokenBySymbol = (symbol: string, tokenList?: Token[]): Token | undefined => {
  return tokenList?.find(t => t.symbol.toUpperCase() === symbol.toUpperCase())
}
