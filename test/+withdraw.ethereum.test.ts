import Everpay from '../src/index'
import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/types'

const provider = new ethers.providers.InfuraProvider('kovan')

test(`${ethWalletHasUSDT.address} withdraw USDT to ${ethWalletHasUSDT2.address}`, async () => {
  const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletHasUSDT.address,
    ethConnectedSigner: signer,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.bsc,
    tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
    amount: '100',
    to: ethWalletHasUSDT2.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})

test(`use another ${ethWalletHasUSDT.address} singer to sign ${ethWalletHasUSDT2.address}'s tx`, async () => {
  const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletHasUSDT2.address,
    ethConnectedSigner: signer,
    debug: true
  })

  await expect(
    everpay.withdraw({
      chainType: ChainType.bsc,
      tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
      amount: '101',
      to: ethWalletHasUSDT.address
    })
  )
    .rejects
    .toThrow('err_invalid_signature')
})
