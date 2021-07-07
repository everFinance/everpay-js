import Everpay from '../src/index'
import { arWallet1 } from './constants/wallet'
import { ChainType, ArweaveTransaction } from '../src/types/global'

const everpay = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  debug: true
})

test(`check ${arWallet1.address} deposit ar`, async () => {
  return await everpay.deposit({
    chainType: ChainType.arweave,
    symbol: 'ar',
    amount: '0.01'
  }).then((arTx) => {
    console.log('arTx', arTx as ArweaveTransaction)
    expect((arTx as ArweaveTransaction).id).toBeTruthy()
  })
})
