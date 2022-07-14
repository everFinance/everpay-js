import Everpay from '../src/index'
import { ethWalletHasUSDT, arWallet2 } from './constants/wallet'
import { ArweaveTransaction, ChainType } from '../src/types'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpayEthereumMode = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  chainType: ChainType.ethereum,
  debug: true
})

test(`check ${ethWalletHasUSDT.address} deposit vrt`, async () => {
  return await everpayEthereumMode.deposit({
    tag: 'arweave-vrt-usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A',
    amount: '0.000000001'
  }).then(ethTx => {
    console.log('ethTx', ethTx)
    expect(ethTx).toBeTruthy()
  })
})

const everpayARMode = new Everpay({
  account: arWallet2.address,
  arJWK: arWallet2.jwk,
  chainType: ChainType.arweave,
  debug: true
})

test(`check ${arWallet2.address} deposit VRT`, async () => {
  return await everpayARMode.deposit({
    tag: 'arweave-vrt-usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A',
    amount: '1'
  }).then((arTx) => {
    console.log('arTx', arTx as ArweaveTransaction)
    expect((arTx as ArweaveTransaction).id).toBeTruthy()
  })
})

test(`check ${arWallet2.address} deposit VRT failed`, async () => {
  await expect(
    everpayARMode.deposit({
      tag: 'arweave-vrt-usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A',
      amount: '0.1'
    })
  )
    .rejects
    .toThrow('DEPOSIT_ARWEAVE_PST_MUST_BE_INTEGER')
})
