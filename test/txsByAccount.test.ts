// import { isString } from 'lodash'
// import { EverpayAction } from '../src/types'
import Everpay, { EverpayActionWithDeposit } from '../src/index'

const everpay = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

test('everpey txsByAccount got correct', async () => {
  return await everpay.txsByAccount({ page: 1, symbol: 'usdt', action: EverpayActionWithDeposit.deposit }).then(txResult => {
    expect(txResult.txs.length).toBeGreaterThan(0)
    expect(txResult.currentPage).toBe(1)
    expect(txResult.txs.every(item => item.action === EverpayActionWithDeposit.deposit)).toBe(true)
  })
})
