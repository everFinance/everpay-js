import Everpay from '../src/index'
import { ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/global'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  connectedSigner: signer,
  debug: true
})

// test('check deposit eth', async () => {
//   return await everpay.deposit({
//     chainType: ChainType.ethereum,
//     symbol: 'eth',
//     amount: 0.01
//   }).then(ethTx => {
//     console.log('ethTx', ethTx)
//     expect(ethTx).toBeTruthy()
//   })
// })

test('check deposit usdt', async () => {
  return await everpay.deposit({
    chainType: ChainType.ethereum,
    symbol: 'usdt',
    amount: 100
  }).then(usdtTx => {
    console.log('usdtTx', usdtTx)
    expect(usdtTx).toBeTruthy()
  })
})
