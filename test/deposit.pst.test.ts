import Everpay from '../src/index'
import { arWallet2 } from './constants/wallet'
import { ArweaveTransaction } from '../src/types'

const everpay = new Everpay({
  account: arWallet2.address,
  arJWK: arWallet2.jwk,
  debug: true
})

test(`check ${arWallet2.address} deposit VRT`, async () => {
  return await everpay.deposit({
    symbol: 'vrt',
    amount: '1'
  }).then((arTx) => {
    console.log('arTx', arTx as ArweaveTransaction)
    expect((arTx as ArweaveTransaction).id).toBeTruthy()
  })
})

test(`check ${arWallet2.address} deposit VRT failed`, async () => {
  await expect(
    everpay.deposit({
      symbol: 'vrt',
      amount: '0.1'
    })
  )
    .rejects
    .toThrow('DEPOSIT_ARWEAVE_PST_MUST_BE_INTEGER')
})
