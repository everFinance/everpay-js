import Everpay from '../src/index'
import { arWallet2, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/types'

const everpay = new Everpay({
  account: arWallet2.address,
  arJWK: arWallet2.jwk,
  chainType: ChainType.arweave,
  debug: true
})

test(`check ${arWallet2.address} transfer ar`, async () => {
  return await everpay.transfer({
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8',
    amount: '0.0000000001',
    to: ethWalletHasUSDT.address,
    data: { hello: 'world', this: 'is everpay' }
  }).then((transferResult) => {
    console.log('transfer ar result', transferResult)
    expect(transferResult.status).toBe('ok')
  })
})
