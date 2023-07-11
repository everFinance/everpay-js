// import { isString } from 'lodash'
// import { EverpayAction } from '../src/types'
import Everpay, { EverpayActionWithDeposit } from '../src/index'

const everpay = new Everpay({
  account: '0x26361130d5d6E798E9319114643AF8c868412859',
  debug: true
})

test('everpey txsByAccount got correct', async () => {
  return await everpay.txsByAccount({ page: 1, tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712', action: EverpayActionWithDeposit.transfer }).then(txResult => {
    expect(txResult.txs.length).toBeGreaterThan(0)
    expect(txResult.currentPage).toBe(1)
    expect(txResult.txs.every(item => item.action === EverpayActionWithDeposit.transfer)).toBe(true)
  })
})
