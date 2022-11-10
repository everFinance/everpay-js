// import { isString } from 'lodash'
// import { EverpayAction } from '../src/types'
import Everpay, { EverpayActionWithDeposit } from '../src/index'

const everpay = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

test('everpey txsByAccount got correct', async () => {
  return await everpay.txsByAccount({ page: 1, tag: 'ethereum-usdt-0xd85476c906b5301e8e9eb58d174a6f96b9dfc5ee', action: EverpayActionWithDeposit.deposit }).then(txResult => {
    expect(txResult.txs.length).toBeGreaterThan(0)
    expect(txResult.currentPage).toBe(1)
    expect(txResult.txs.every(item => item.action === EverpayActionWithDeposit.deposit)).toBe(true)
  })
})
