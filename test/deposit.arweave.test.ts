import Everpay from '../src/index'
import { arWallet1 } from './constants/wallet'
import { ArweaveTransaction, ChainType } from '../src/types'

const everpay = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  chainType: ChainType.arweave,
  debug: true
})

test(`check ${arWallet1.address} deposit ar`, async () => {
  return await everpay.deposit({
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8',
    amount: '0.0000001'
  }).then((arTx) => {
    console.log('arTx', arTx as ArweaveTransaction)
    expect((arTx as ArweaveTransaction).id).toBeTruthy()
  })
})
