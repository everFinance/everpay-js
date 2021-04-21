import Everpay from '../src/index'
import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/global'

const provider = new ethers.providers.InfuraProvider('kovan')

test(`${ethWalletHasUSDT2.address} withdraw USDT to ${ethWalletHasUSDT.address}`, async () => {
  const signer = new ethers.Wallet(ethWalletHasUSDT2.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletHasUSDT2.address,
    connectedSigner: signer,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    symbol: 'usdt',
    amount: 8,
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})

test(`use another ${ethWalletHasUSDT.address} singer to sign ${ethWalletHasUSDT2.address}'s tx`, async () => {
  const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletHasUSDT2.address,
    connectedSigner: signer,
    debug: true
  })

  await expect(
    everpay.withdraw({
      chainType: ChainType.ethereum,
      symbol: 'usdt',
      amount: 8,
      to: ethWalletHasUSDT.address
    })
  )
    .rejects
    .toThrow('err_invalid_signature')
})
