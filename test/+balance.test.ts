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
      tag: 'ethereum-eth-0x0000000000000000000000000000000000000000'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} eth balance: ${balance}`)
      expect(+balance).toBeGreaterThanOrEqual(0)
    })
  })

  test(`${ethWalletHasUSDT.address} ar balance is greater than 0`, async () => {
    return await everpay1.balance({
      tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} ar balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT.address} usdt balance is greater than 0`, async () => {
    return await everpay1.balance({
      tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} usdt balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT2.address} usdt balance is greater than 0`, async () => {
    return await everpay2.balance({
      account: ethWalletHasUSDT.address,
      tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712'
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
        tag: 'ethereum-eth-0x0000000000000000000000000000000000000000'
      })
    )
      .rejects
      .toThrow(ERRORS.ACCOUNT_NOT_FOUND)
  })

  test('no tag', async () => {
    await expect(
      everpay2.balance({
        account: ethWalletHasUSDT2.address,
        tag: ''
      })
    )
      .rejects
      .toThrow(ERRORS.TAG_NOT_FOUND)
  })

  test('no token', async () => {
    await expect(
      everpay2.balance({
        account: ethWalletHasUSDT2.address,
        tag: 'btc'
      })
    )
      .rejects
      .toThrow(ERRORS.TOKEN_NOT_FOUND)
  })
})
