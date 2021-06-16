import Everpay from '../src/index'
import { arWallet1 } from './constants/wallet'
import { ChainType } from '../src/global'

test(`${arWallet1.address} withdraw ar to ${arWallet1.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet1.address,
    arJWK: arWallet1.jwk,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.arweave,
    symbol: 'ar',
    amount: '1',
    to: arWallet1.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
