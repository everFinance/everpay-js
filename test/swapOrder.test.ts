import { isString } from 'lodash'
import Everpay from '../src/index'
import { ethWalletHasUSDT, arWallet1 } from './constants/wallet'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpayEthAccount = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  debug: true
})

const everpayArAccount = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  debug: true
})

describe('test swap order error', () => {
  test('price invalid', async () => {
    const aswapData = await everpayArAccount.getAswapData({
      tokenIn: 'ETH',
      tokenOut: 'usdt',
      tokenInAmount: '0.606',
      tokenOutAmount: '526526'
    })
    await expect(
      everpayArAccount.swapOrder(aswapData)
    )
      .rejects
      .toThrow()
  })
})

test('ethereum account swap order success', async () => {
  let everHash = ''
  const aswapData = await everpayEthAccount.getAswapData({
    tokenIn: 'ETH',
    tokenOut: 'usdt',
    tokenInAmount: '0.01',
    tokenOutAmount: '20.666'
  })
  everHash = await everpayEthAccount.swapOrder(aswapData)

  expect(isString(everHash)).toBe(true)

  const transaction = await everpayEthAccount.txByHash(everHash)
  expect(transaction.action).toBe('aswap')
})

test('arweave account swap order success', async () => {
  const aswapData = await everpayArAccount.getAswapData({
    tokenIn: 'ETH',
    tokenOut: 'usdt',
    tokenInAmount: '0.001',
    tokenOutAmount: '2.0666'
  })
  const everHash = await everpayArAccount.swapOrder(aswapData)
  expect(isString(everHash)).toBe(true)

  const transaction = await everpayArAccount.txByHash(everHash)
  expect(transaction.action).toBe('aswap')
})
