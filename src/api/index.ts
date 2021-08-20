import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isObject, isString } from 'lodash-es'
import { stringify as qsStringify } from 'query-string'
import { EverpayInfo, EverpayTransaction, EverpayTx, TxsResult, ExpressInfo } from '../types'
import {
  GetEverpayTransactionsParams,
  GetEverpayBalanceParams,
  GetEverpayBalanceResult,
  GetEverpayBalancesParams,
  GetEverpayBalancesResult,
  PostEverpayTxResult,
  SwapInfo,
  SwapPriceParams,
  PlaceOrderParams,
  SwapPriceResult
} from '../types/api'

// `validateStatus` defines whether to resolve or reject the promise for a given
// HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
// or `undefined`), the promise will be resolved; otherwise, the promise will be rejected.
const validateStatus = function (status: number): boolean {
  return status >= 200 && status < 300 // default
}

const rConfig = {
  timeout: 5000,
  validateStatus,
  headers: {
    'Content-Type': 'application/json'
  }
}

export const sendRequest = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  return await new Promise((resolve, reject) => {
    axios({
      ...rConfig,
      ...config
    }).then((res: AxiosResponse) => {
      if (res.data !== undefined) {
        resolve(res)
      } else {
        reject(new Error(`${config.url ?? ''}: null response`))
      }
    }).catch(error => {
      if (isString(error)) {
        reject(new Error(error))
      } else if (isObject(error.response) && isObject(error.response.data)) {
        // like { error: 'err_invalid_signature' }
        reject(new Error(error.response.data.error))
      }
    })
  })
}

export const getEverpayInfo = async (apiHost: string): Promise<EverpayInfo> => {
  const url = `${apiHost}/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  return result.data
}

export const getEverpayBalance = async (apiHost: string, {
  account,
  tokenTag
}: GetEverpayBalanceParams): Promise<GetEverpayBalanceResult> => {
  const url = `${apiHost}/balance/${tokenTag}/${account}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getEverpayBalances = async (apiHost: string, {
  account
}: GetEverpayBalancesParams): Promise<GetEverpayBalancesResult> => {
  const url = `${apiHost}/balances/${account}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getEverpayTransactions = async (apiHost: string, params: GetEverpayTransactionsParams): Promise<TxsResult> => {
  const { account, page, tokenId, action } = params
  const baseUrl = account !== undefined ? `${apiHost}/txs/${account}` : `${apiHost}/txs`
  const queryString = qsStringify({ page, tokenId, action }, { skipNull: true })
  const result = await sendRequest({
    ...rConfig,
    url: `${baseUrl}${queryString !== '' ? `?${queryString}` : ''}`,
    method: 'GET'
  })
  return result.data
}

export const getEverpayTransaction = async (apiHost: string, everHash: string): Promise<EverpayTransaction> => {
  const url = `${apiHost}/tx/${everHash}`
  const result = await sendRequest({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data.tx
}

export const getMintdEverpayTransactionByChainTxHash = async (apiHost: string, chainTxHash: string): Promise<EverpayTransaction> => {
  const url = `${apiHost}/minted/${chainTxHash}`
  const result = await sendRequest({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data.tx
}

export const postTx = async (apiHost: string, params: EverpayTx): Promise<PostEverpayTxResult> => {
  const url = `${apiHost}/tx`
  const result = await sendRequest({
    url,
    method: 'POST',
    data: params
  })
  return result.data
}

export const getExpressInfo = async (apiHost: string): Promise<ExpressInfo> => {
  const url = `${apiHost}/withdraw/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  return result.data
}

export const getSwapInfo = async (apiHost: string): Promise<SwapInfo> => {
  const url = `${apiHost}/dex/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  return result.data
}

export const getSwapPrice = async (apiHost: string, params: SwapPriceParams): Promise<SwapPriceResult> => {
  const queryString = qsStringify(params, { skipNull: true })
  const url = `${apiHost}/dex/price?${queryString}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  // TODO: temp fix server typo
  if (result.data.tokeIn != null) {
    result.data.tokenIn = result.data.tokeIn
  }

  return result.data
}

export const placeSwapOrder = async (apiHost: string, order: PlaceOrderParams): Promise<string> => {
  const url = `${apiHost}/dex/place_order`
  const result = await sendRequest({
    url,
    method: 'POST',
    data: { order }
  })
  return result.data.everHash
}
