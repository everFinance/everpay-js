export const everpayTxVersion = 'v1'

export const getEverpayHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io'
}
