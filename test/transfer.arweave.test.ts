import Everpay from '../src/index'
import { arWallet1, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/global'

const everpay = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  debug: true
})

test(`check ${arWallet1.address} transfer ar`, async () => {
  return await everpay.transfer({
    chainType: ChainType.arweave,
    symbol: 'ar',
    amount: '0.0000000001',
    to: ethWalletHasUSDT.address
  }).then((transferResult) => {
    console.log('transfer ar result', transferResult)
    expect(transferResult.status).toBe('ok')
  })
})
