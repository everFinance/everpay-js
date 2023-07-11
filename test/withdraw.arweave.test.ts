import Everpay from '../src/index'
import { arWallet1, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/types'

test(`${arWallet1.address} withdraw ar to ${arWallet1.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet1.address,
    chainType: ChainType.arweave,
    arJWK: arWallet1.jwk,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.arweave,
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8',
    amount: '0.000010001',
    to: arWallet1.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})

test(`${arWallet1.address} withdraw ar to ethereum address ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet1.address,
    chainType: ChainType.arweave,
    arJWK: arWallet1.jwk,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8',
    amount: '0.000010001',
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
