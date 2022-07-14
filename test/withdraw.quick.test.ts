import Everpay from '../src/index'
import { arWallet1, ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/types'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

test(`${ethWalletHasUSDT.address} quick withdraw USDT to ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: ethWalletHasUSDT.address,
    ethConnectedSigner: signer,
    chainType: ChainType.ethereum,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    tag: 'ethereum-usdt-0xd85476c906b5301e8e9eb58d174a6f96b9dfc5ee',
    amount: '99',
    quickMode: true
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})

test(`${arWallet1.address} quick withdraw USDT to ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet1.address,
    arJWK: arWallet1.jwk,
    chainType: ChainType.arweave,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    tag: 'ethereum-usdt-0xd85476c906b5301e8e9eb58d174a6f96b9dfc5ee',
    amount: '52.6',
    quickMode: true,
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
