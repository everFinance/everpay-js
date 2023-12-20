import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import { stringify as qsStringify } from 'query-string'
import {
  EverpayInfo,
  EverpayTransaction,
  EverpayTx,
  TxsResult,
  FeeItem,
  ExpressInfo,
  EmailRegisterData
} from '../types'
import {
  GetEverpayTransactionsParams,
  GetEverpayBalanceParams,
  GetEverpayBalanceResult,
  GetEverpayBalancesParams,
  GetEverpayBalancesResult,
  PostEverpayTxResult
} from '../types/api'

// `validateStatus` defines whether to resolve or reject the promise for a given
// HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
// or `undefined`), the promise will be resolved; otherwise, the promise will be rejected.
const validateStatus = function (status: number): boolean {
  return status >= 200 && status < 300 // default
}

const rConfig = {
  timeout: 15000,
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
      } else {
        reject(new Error(error))
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
  const { account, tokenTag, action, withoutAction, cursor } = params
  const baseUrl = account !== undefined ? `${apiHost}/txs/${account}` : `${apiHost}/txs`
  const queryString = qsStringify({ cursor, tokenTag, action, withoutAction }, { skipNull: true })
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

export const getFees = async (apiHost: string): Promise<FeeItem[]> => {
  const url = `${apiHost}/fees`
  const result = await sendRequest({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data.fees
}

export const getFee = async (apiHost: string, tokenTag: string): Promise<FeeItem> => {
  const url = `${apiHost}/fee/${tokenTag}`
  const result = await sendRequest({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data.fee
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

export const getEmailRegisterData = async (apiHost: string, email: string): Promise<EmailRegisterData> => {
  const url = `${apiHost}/account/register/${email}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  return result.data
}

export const getAccountData = async (apiHost: string, account: string): Promise<any> => {
  const url = `${apiHost}/account/${account}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })

  return result.data
}
