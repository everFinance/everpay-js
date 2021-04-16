import axios from 'axios'
import { GetEverpayBalanceParams, GetEverpayBalanceResult } from './interface'

const rConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36'
  }
}

export const getEverpayInfo = async function (apiHost: string): Promise<EverpayInfo> {
  const url = `${apiHost}/info`
  const data = await axios({
    ...rConfig,
    url,
    method: 'GET'
  })
  return data.data
}

export const getEverpayBalance = async function (apiHost: string, {
  chainType,
  symbol,
  contractAddress,
  account
}: GetEverpayBalanceParams): Promise<GetEverpayBalanceResult> {
  const url = `${apiHost}/balanceOf/${chainType}-${symbol}-${contractAddress}/${account}`
  const data = await axios({
    ...rConfig,
    url,
    method: 'GET'
  })
  return data.data
}
