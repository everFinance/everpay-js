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
    return await everpay1.balance({
      symbol: 'eth'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} eth balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT.address} ar balance is greater than 0`, async () => {
    return await everpay1.balance({
      symbol: 'ar'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} ar balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT.address} usdt balance is greater than 0`, async () => {
    return await everpay1.balance({
      symbol: 'usdt'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} usdt balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT2.address} usdt balance is greater than 0`, async () => {
    return await everpay2.balance({
      account: ethWalletHasUSDT.address,
      symbol: 'usdt'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT2.address} balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })
})

describe('test balance error', () => {
  test('no account', async () => {
    await expect(
      everpay2.balance({
        symbol: 'eth'
      })
    )
      .rejects
      .toThrow(ERRORS.ACCOUNT_NOT_FOUND)
  })

  test('no symbol', async () => {
    await expect(
      everpay2.balance({
        account: ethWalletHasUSDT2.address,
        symbol: ''
      })
    )
      .rejects
      .toThrow(ERRORS.SYMBOL_NOT_FOUND)
  })

  test('no token', async () => {
    await expect(
      everpay2.balance({
        account: ethWalletHasUSDT2.address,
        symbol: 'btc'
      })
    )
      .rejects
      .toThrow(ERRORS.TOKEN_NOT_FOUND)
  })
})
