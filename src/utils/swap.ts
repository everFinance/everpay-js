import { v4 as uuidv4 } from 'uuid'
import { bundleInternalTxVersion } from '../config'
import { EverpayInfo, Token, BundleItem, BundleData } from '../types'
import { SwapInfo, SwapOrder, SwapPriceParams } from '../types/api'
import { ERRORS } from './errors'
import { fromDecimalToUnit, fromUnitToDecimal, genTokenTag, getTokenBySymbol, getTokenByTag, matchTokenTag } from './util'

interface SwapTokenInfo {
  tokenIn: Token
  tokenOut: Token
  tokenInTag: string
  tokenOutTag: string
}

export const getSwapTokenInfo = (params: SwapPriceParams, everpayInfo: EverpayInfo, swapInfo: SwapInfo): SwapTokenInfo => {
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

// symbol => tag, unit amount => decimal amount
export const swapParamsClientToServer = (params: SwapPriceParams, everpayInfo: EverpayInfo, swapInfo: SwapInfo): SwapPriceParams => {
  const swapTokenInfo = getSwapTokenInfo(params, everpayInfo, swapInfo)
  const { tokenInAmount, tokenOutAmount } = params
  let tokenInAmountDecimal = ''
  let tokenOutAmountDecimal = ''
  const result: SwapPriceParams = {
    tokenIn: swapTokenInfo.tokenInTag,
    tokenOut: swapTokenInfo.tokenOutTag
  }

  if (tokenInAmount != null) {
    tokenInAmountDecimal = fromUnitToDecimal(tokenInAmount, swapTokenInfo.tokenIn.decimals)
    result.tokenInAmount = tokenInAmountDecimal
  }
  if (tokenOutAmount != null) {
    tokenOutAmountDecimal = fromUnitToDecimal(tokenOutAmount, swapTokenInfo.tokenOut.decimals)
    result.tokenOutAmount = tokenOutAmountDecimal
  }
  return result
}

// tag => symbol, decimal amount => unit amount
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

export const genSwapItems = (order: SwapOrder, everpayInfo: EverpayInfo, swapInfo: SwapInfo, account: string): BundleItem[] => {
  const swapTokenInfo = getSwapTokenInfo(order, everpayInfo, swapInfo)
  const serverOrder = swapParamsClientToServer(order, everpayInfo, swapInfo) as SwapOrder
  return [
    // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
    {
      tag: swapTokenInfo.tokenInTag,
      chainID: swapTokenInfo.tokenIn.chainID,
      from: account,
      to: swapInfo.address,
      amount: serverOrder.tokenInAmount
    },
    {
      tag: swapTokenInfo.tokenOutTag,
      chainID: swapTokenInfo.tokenOut.chainID,
      from: swapInfo.address,
      to: account,
      amount: serverOrder.tokenOutAmount
    }
  ]
}

export const getSwapData = (order: SwapOrder, everpayInfo: EverpayInfo, swapInfo: SwapInfo, account: string): BundleData => {
  const items = genSwapItems(order, everpayInfo, swapInfo, account)
  // 设置 60s 过期
  const expiration = Math.round(Date.now() / 1000) + 60
  const salt = uuidv4()
  const version = bundleInternalTxVersion

  return {
    // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
    items,
    expiration,
    salt,
    version
  }
}
