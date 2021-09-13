import { EverpayInfo, Token, SwapInfo, SwapPriceParams } from '../types'
import { ERRORS } from './errors'
import { fromDecimalToUnit, fromUnitToDecimal, genTokenTag, getTokenBySymbol, getTokenByTag, matchTokenTag } from './util'

interface SwapTokenInfo {
  tokenIn: Token
  tokenOut: Token
  tokenInTag: string
  tokenOutTag: string
}

const getSwapTokensInfo = (params: SwapPriceParams, everpayInfo: EverpayInfo, swapInfo: SwapInfo): SwapTokenInfo => {
  const { tokenIn, tokenOut } = params
  const tokenInObj = getTokenBySymbol(tokenIn, everpayInfo.tokenList)
  const tokenOutObj = getTokenBySymbol(tokenOut, everpayInfo.tokenList)
  let tokenInTag: string = null as any
  let tokenOutTag: string = null as any

  if (tokenInObj == null || tokenOutObj == null) {
    throw new Error(ERRORS.TOKEN_NOT_FOUND)
  }

  swapInfo.tokenList.forEach(tag => {
    if (matchTokenTag(genTokenTag(tokenInObj), tag)) {
      tokenInTag = tag
    }
    if (matchTokenTag(genTokenTag(tokenOutObj), tag)) {
      tokenOutTag = tag
    }
  })

  if (tokenInTag == null || tokenOutTag == null) {
    throw new Error(ERRORS.UNSUPPORTED_TOKEN_SWAP)
  }

  return { tokenIn: tokenInObj, tokenOut: tokenOutObj, tokenInTag, tokenOutTag }
}

// symbol => tag, uint amount => decimal amount
export const swapParamsClientToServer = (params: SwapPriceParams, everpayInfo: EverpayInfo, swapInfo: SwapInfo): SwapPriceParams => {
  const swapTokensInfo = getSwapTokensInfo(params, everpayInfo, swapInfo)
  const { tokenInAmount, tokenOutAmount } = params
  let tokenInDecimalAmount = ''
  let tokenOutDecimalAmount = ''
  const result: SwapPriceParams = {
    tokenIn: swapTokensInfo.tokenInTag,
    tokenOut: swapTokensInfo.tokenOutTag
  }

  if (tokenInAmount != null) {
    tokenInDecimalAmount = fromUnitToDecimal(tokenInAmount, swapTokensInfo.tokenIn.decimals)
    result.tokenInAmount = tokenInDecimalAmount
  }
  if (tokenOutAmount != null) {
    tokenOutDecimalAmount = fromUnitToDecimal(tokenOutAmount, swapTokensInfo.tokenOut.decimals)
    result.tokenOutAmount = tokenOutDecimalAmount
  }
  return result
}

// tag => symbol, decimal amount => uint amount
export const swapParamsServerToClient = (params: SwapPriceParams, everpayInfo: EverpayInfo, swapInfo: SwapInfo): SwapPriceParams => {
  const { tokenIn, tokenOut, tokenInAmount, tokenOutAmount } = params
  const tokenInObj = getTokenByTag(tokenIn, everpayInfo.tokenList) as Token
  const tokenOutObj = getTokenByTag(tokenOut, everpayInfo.tokenList) as Token
  const result: SwapPriceParams = {
    tokenIn: tokenInObj.symbol,
    tokenOut: tokenOutObj.symbol
  }

  if (tokenInAmount != null) {
    result.tokenInAmount = fromDecimalToUnit(tokenInAmount, tokenInObj.decimals)
  }
  if (tokenOutAmount != null) {
    result.tokenOutAmount = fromDecimalToUnit(tokenOutAmount, tokenOutObj.decimals)
  }
  return result
}
