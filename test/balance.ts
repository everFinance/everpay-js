import { ethWalletHasUSDT } from './wallet'
import Everpay from '../src/index'

const address1 = '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9'
const address2 = ethWalletHasUSDT.address

const everpay1 = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

const everpay2 = new Everpay({
  debug: true
})

export default async (): Promise<void> => {
  const balance1 = await everpay1.balance({
    symbol: 'eth'
  })
  console.log(`${address1} balance: `, balance1)

  const balance2 = await everpay2.balance({
    account: address2, symbol: 'eth'
  })
  console.log(`${address2} balance: `, balance2)
}
