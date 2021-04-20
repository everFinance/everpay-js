// import { isString } from 'lodash'
// import { EverpayAction } from '../src/global'
import Everpay from '../src/index'

const everpay = new Everpay({
  debug: true
})

test('everpey info got correct', async () => {
  return await everpay.txs().then(transactions => {
    expect(transactions.length).toBeGreaterThan(0)
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
