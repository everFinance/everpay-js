import Everpay from '../src/index'
import { arWallet2, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/types'

test(`${arWallet2.address} withdraw vrt to ${arWallet2.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet2.address,
    arJWK: arWallet2.jwk,
    chainType: ChainType.arweave,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.arweave,
    symbol: 'vrt',
    amount: '1',
    to: arWallet2.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})

test(`check ${arWallet2.address} withdraw VRT failed`, async () => {
  const everpay = new Everpay({
    account: arWallet2.address,
    arJWK: arWallet2.jwk,
    chainType: ChainType.arweave,
    debug: true
  })
  await expect(
    everpay.withdraw({
      chainType: ChainType.arweave,
      symbol: 'vrt',
      amount: '0.1'
    })
  )
    .rejects
    .toThrow('PST_WITHDARW_TO_ARWEAVE_MUST_BE_INTEGER')
})

test(`${arWallet2.address} withdraw vrt to ethereum address ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet2.address,
    arJWK: arWallet2.jwk,
    chainType: ChainType.arweave,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    symbol: 'vrt',
    amount: '0.000010001',
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
