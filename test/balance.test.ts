// TODO: fix axios 2 request error
// import { ethWalletHasUSDT } from './constants/wallet'
import Everpay from '../src/index'

const address1 = '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9'
// const address2 = ethWalletHasUSDT.address

const everpay1 = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

// const everpay2 = new Everpay({
//   debug: true
// })

test(`${address1} balance is greater than 0`, async () => {
  return await everpay1.balance({
    symbol: 'eth'
  }).then(balance => {
    console.log(`${address1} balance: ${balance}`)
    expect(balance).toBeGreaterThan(0)
  })
})

// test(`${address2} balance is greater than or equal 0`, async () => {
//   return await everpay2.balance({
//     symbol: 'eth'
//   }).then(balance => {
//     expect(balance).toBeGreaterThanOrEqual(0)
//   })
// })
