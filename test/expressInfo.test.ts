import { isString, isNumber } from 'lodash'
import Everpay from '../src/index'

const everpay = new Everpay({
  debug: true
})

test('express info got correct', async () => {
  return await everpay.expressInfo().then(expressInfo => {
    const { address, withdrawTimeCost, tokens } = expressInfo
    expect(isString(address)).toBe(true)
    expect(isNumber(withdrawTimeCost)).toBe(true)
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens.find(t => t.tokenTag.toLowerCase().includes('usdt'))).toBeTruthy()
  })
})
