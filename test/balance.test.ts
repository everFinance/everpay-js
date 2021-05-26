import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import { ChainType } from '../src/global'
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
      chainType: ChainType.ethereum,
      symbol: 'eth'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT.address} usdt balance is greater than 0`, async () => {
    return await everpay1.balance({
      chainType: ChainType.ethereum,
      symbol: 'usdt'
    }).then(balance => {
      console.log(`${ethWalletHasUSDT.address} balance: ${balance}`)
      expect(+balance).toBeGreaterThan(0)
    })
  })

  test(`${ethWalletHasUSDT2.address} usdt balance is greater than 0`, async () => {
    return await everpay2.balance({
      chainType: ChainType.ethereum,
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
        chainType: ChainType.ethereum,
        symbol: 'eth'
      })
    )
      .rejects
      .toThrow(ERRORS.ACCOUNT_NOT_FOUND)
  })

  test('no symbol', async () => {
    await expect(
      everpay2.balance({
        chainType: ChainType.ethereum,
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
        chainType: ChainType.ethereum,
        account: ethWalletHasUSDT2.address,
        symbol: 'btc'
      })
    )
      .rejects
      .toThrow(ERRORS.TOKEN_NOT_FOUND)
  })
})
