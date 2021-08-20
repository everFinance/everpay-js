import { isString } from 'lodash'
import Everpay from '../src/index'

const everpay = new Everpay({
  debug: true
})

test('swap price got correct', async () => {
  return await everpay.swapPrice({
    tokenIn: 'ETH',
    tokenOut: 'usdt',
    tokenInAmount: '0.111'
  }).then(swapPrice => {
    const { tokenIn, tokenOut, tokenInAmount, tokenOutAmount, indicativePrice, spreadPercent } = swapPrice
    expect(tokenIn).toBe('ETH')
    expect(tokenOut).toBe('USDT')
    expect(tokenInAmount).toBe('0.111')
    expect(isString(tokenOutAmount)).toBe(true)
    expect(+tokenOutAmount).toBeGreaterThan(0)
    expect(+indicativePrice).toBeGreaterThan(0)
    expect(isString(spreadPercent)).toBeTruthy()
  })
})
