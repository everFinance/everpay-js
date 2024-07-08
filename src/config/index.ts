export const everpayTxVersion = 'v1'

export const bundleInternalTxVersion = 'v1'

export const getEverpayHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io'
}

export const getExpressHost = (debug?: boolean): string => {
  return debug === true ? 'https://express-dev.everpay.io' : 'https://express.everpay.io'
}

export const getExplorerHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-explorer-dev.everpay.io' : 'https://api-explorer.everpay.io'
}