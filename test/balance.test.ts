import { ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/global'
import Everpay from '../src/index'
import { ERRORS } from '../src/utils/errors'

const address1 = '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9'
const address2 = ethWalletHasUSDT.address

const everpay1 = new Everpay({
  account: address1,
  debug: true
})

const everpay2 = new Everpay({
  debug: true
})

describe('test balance', () => {
  test(`${address1} balance is greater than 0`, async () => {
    return await everpay1.balance({
      chainType: ChainType.ethereum,
      symbol: 'eth'
    }).then(balance => {
      console.log(`${address1} balance: ${balance}`)
      expect(balance).toBeGreaterThan(0)
    })
  })

  test(`${address2} balance is greater than or equal 0`, async () => {
    return await everpay2.balance({
      chainType: ChainType.ethereum,
      account: ethWalletHasUSDT.address,
      symbol: 'eth'
    }).then(balance => {
      console.log(`${address2} balance: ${balance}`)
      expect(balance).toBeGreaterThanOrEqual(0)
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
        account: address2,
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
        account: address2,
        symbol: 'btc'
      })
    )
      .rejects
      .toThrow(ERRORS.TOKEN_NOT_FOUND)
  })
})
