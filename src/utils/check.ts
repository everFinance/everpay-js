import { ChainType, Config } from '../global'
import { ERRORS } from './errors'

interface CaseObject {
  [key: string]: string
}

const cases: CaseObject = {
  symbol: ERRORS.SYMBOL_NOT_FOUND,
  token: ERRORS.TOKEN_NOT_FOUND,
  account: ERRORS.ACCOUNT_NOT_FOUND,
  to: ERRORS.TO_NOT_FOUND,
  ethConnectedSigner: ERRORS.ETH_SIGENER_NOT_FOUND
}

export const checkItem = (itemName: string, param?: unknown): void => {
  if (param === null || param === undefined || param === '' || param === 0) {
    throw new Error(cases[itemName])
  }
  if (itemName === 'amount' && !((param as number) > 0)) {
    throw new Error(ERRORS.AMOUNT_INVALID)
  }
}

export const checkParams = (params: Record<string, unknown>): void => {
  Object.keys(params).forEach(key => checkItem(key, params[key]))
}

export const checkSignConfig = (accountType: ChainType, config: Config): void => {
  if (accountType === ChainType.ethereum) {
    checkItem('ethConnectedSigner', config.ethConnectedSigner)
  } else if (accountType === ChainType.arweave) {
    checkItem('arJWK', config.arJWK)
  }
}
