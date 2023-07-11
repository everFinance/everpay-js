import Everpay from '../src/index'
import { arWallet1, ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/types'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

test(`${ethWalletHasUSDT.address} quick withdraw tUSDC to ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: ethWalletHasUSDT.address,
    ethConnectedSigner: signer,
    chainType: ChainType.ethereum,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.bsc,
    tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
    amount: '99',
    quickMode: false
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
    chainType: ChainType.bsc,
    tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
    amount: '52.6',
    quickMode: false,
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
