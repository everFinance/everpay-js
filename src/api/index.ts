import axios from 'axios'
import { EverpayInfo } from '../global'
import { GetEverpayBalanceParams, GetEverpayBalanceResult, PostEverpayTxParams, PostEverpayTxResult } from './interface'

const rConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36'
  }
}

export const getEverpayInfo = async function (apiHost: string): Promise<EverpayInfo> {
  const url = `${apiHost}/info`
  const result = await axios({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data
}

export const getEverpayBalance = async function (apiHost: string, {
  chainType,
  tokenSymbol,
  id,
  account
}: GetEverpayBalanceParams): Promise<GetEverpayBalanceResult> {
  const url = `${apiHost}/balanceOf/${chainType}-${tokenSymbol}-${id}/${account}`
  const result = await axios({
    ...rConfig,
    url,
    method: 'GET'
  })
  return result.data
}

export const postTx = async (apiHost: string, params: PostEverpayTxParams): Promise<PostEverpayTxResult> => {
  const url = `${apiHost}/tx`
  const result = await axios({
    ...rConfig,
    url,
    method: 'POST',
    data: params
  })
  return result.data
}
