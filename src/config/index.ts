export const burnFeeAmount = 0.01

export const everpayTxVersion = 'v1'

export const getEverpayHost = (debug?: boolean): string => {
  return debug === true ? 'https://api-kovan.everpay.io' : 'https://api.everpay.io'
}
