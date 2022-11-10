import Everpay from '../src/index'
import { arWallet1, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/types'

const everpay = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  chainType: ChainType.arweave,
  debug: true
})

test(`check ${arWallet1.address} transfer ar`, async () => {
  return await everpay.transfer({
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0xcc9141efa8c20c7df0778748255b1487957811be',
    amount: '0.0000000001',
    to: ethWalletHasUSDT.address,
    data: { hello: 'world', this: 'is everpay' }
  }).then((transferResult) => {
    console.log('transfer ar result', transferResult)
    expect(transferResult.status).toBe('ok')
  })
})
