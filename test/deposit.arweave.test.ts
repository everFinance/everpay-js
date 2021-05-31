import Everpay from '../src/index'
import { arWallet1 } from './constants/wallet'
import { ChainType } from '../src/global'
import { ArTransferResult } from '../src/lib/interface'

const everpay = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  debug: true
})

test(`check ${arWallet1.address} deposit ar`, async () => {
  return await everpay.deposit({
    chainType: ChainType.arweave,
    symbol: 'ar',
    amount: 0.01
  }).then((arTx) => {
    console.log('arTx', arTx as ArTransferResult)
    expect((arTx as ArTransferResult).status).toBeTruthy()
  })
})
