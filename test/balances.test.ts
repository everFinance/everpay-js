import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import Everpay from '../src/index'
import { ERRORS } from '../src/utils/errors'

const everpay1 = new Everpay({
  account: ethWalletHasUSDT.address,
  debug: true
})

const everpay2 = new Everpay({
  debug: true
})

describe('test balance', () => {
  test(`${ethWalletHasUSDT.address} eth balance is greater than 0`, async () => {
    return await everpay1.balances({
    }).then(balances => {
      console.log('balances', balances)
      expect(balances.length).toBeGreaterThan(0)
      expect(+balances.find(i => i.symbol === 'ETH').balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT2.address} usdt balance is greater than 0`, async () => {
    return await everpay2.balances({
      account: ethWalletHasUSDT.address
    }).then(balances => {
      expect(balances.length).toBeGreaterThan(0)
      expect(+balances.find(i => i.symbol === 'USDT').balance).toBeGreaterThan(0)
    })
  })
})

describe('test balance error', () => {
  test('no account', async () => {
    await expect(
      everpay2.balances()
    )
      .rejects
      .toThrow(ERRORS.ACCOUNT_NOT_FOUND)
  })
})
