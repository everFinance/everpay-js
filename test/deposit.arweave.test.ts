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
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0xcc9141efa8c20c7df0778748255b1487957811be',
    amount: '0.0000001'
  }).then((arTx) => {
    console.log('arTx', arTx as ArweaveTransaction)
    expect((arTx as ArweaveTransaction).id).toBeTruthy()
  })
})
