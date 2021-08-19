import { isString } from 'lodash'
import Everpay from '../src/index'

const everpay = new Everpay({
  debug: true
})

test('express info got correct', async () => {
  return await everpay.swapInfo().then(swapInfo => {
    const { address, tokenList } = swapInfo
    expect(isString(address)).toBe(true)
    expect(tokenList).toBeGreaterThan(0)
    expect(tokenList.find(tag => tag.toLowerCase().includes('usdt'))).toBeTruthy()
  })
})
