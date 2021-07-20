export const everpayTxVersion = 'v1'

export const getEverpayHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io'
}

export const getEverpayExpressHost = (debug?: boolean): string => {
  // return debug === true ? 'https://express-dev.everpay.io' : 'https://express.everpay.io'
  return debug === true ? 'https://express.xiaojay.net' : 'https://express.xiaojay.net'
}
