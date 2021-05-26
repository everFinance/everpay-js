import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isObject, isString } from 'lodash-es'
import { EverpayInfo, EverpayTx, TxsResult } from '../global'
import {
  GetEverpayTransactionsParams,
  GetEverpayBalanceParams,
  GetEverpayBalanceResult,
  GetEverpayBalancesParams,
  GetEverpayBalancesResult,
  PostEverpayTxResult
} from './interface'

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

  // const tokenList = result.data.tokenList
  // TODO: for test
  // tokenList.push({
  //   id: '0x0000000000000000000000000000000000000000',
  //   symbol: 'AR',
  //   decimals: 12,
  //   totalSupply: '70000000000000000',
  //   chainType: 'arweave',
  //   burnFee: '20000000000000000',
  //   transferFee: '0'
  // })

  return result.data
}

export const getEverpayBalance = async (apiHost: string, {
  chainType,
  symbol,
  id,
  account
}: GetEverpayBalanceParams): Promise<GetEverpayBalanceResult> => {
  const url = `${apiHost}/balanceOf/${chainType}-${symbol}-${id}/${account}`
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
  const { account, page } = params
  const url = account !== undefined ? `${apiHost}/txs/${account}?page=${page}` : `${apiHost}/txs?page=${page}`
  const result = await sendRequest({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data
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
