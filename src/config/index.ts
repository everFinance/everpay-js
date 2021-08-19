export const everpayTxVersion = 'v1'

export const aswapTxVersion = 'v1'

export const getEverpayHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io'
}

export const getExpressHost = (debug?: boolean): string => {
  return debug === true ? 'https://express-dev.everpay.io' : 'https://express.everpay.io'
}

export const getSwapHost = (debug?: boolean): string => {
  return debug === true ? 'https://warriors-dev.everpay.io' : 'https://warriors.everpay.io'
}
