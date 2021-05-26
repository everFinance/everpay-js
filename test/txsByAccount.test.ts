// import { isString } from 'lodash'
// import { EverpayAction } from '../src/global'
import Everpay from '../src/index'

const everpay = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

test('everpey info got correct', async () => {
  return await everpay.txsByAccount({ page: 1 }).then(txResult => {
    expect(txResult.txs.length).toBeGreaterThan(0)
    expect(txResult.currentPage).toBe(1)
    // for (const tx of transactions) {
    //   const { action, data } = tx
    //   if (action === EverpayAction.transfer) {
    //     expect(data).toBe('')
    //   } else if (action === EverpayAction.withdraw) {
    //     expect(data[0]).toBe('{')
    //   }
    // }
  })
})
