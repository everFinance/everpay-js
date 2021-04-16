import { isObject } from 'lodash'
import { ERRORS } from '../utils/errors'

const config: Config = {
  debug: false,
  account: ''
}

export const setConfig = (params: Config): Config => {
  if (!isObject(params)) throw new Error(ERRORS.INVALID_CONFIG_PARAMS)
  return Object.assign(config, params)
}

export const getConfig = (): Config => {
  return config
}
