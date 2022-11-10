import Everpay from '../src/index'
import { ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  debug: true
})

test(`check ${ethWalletHasUSDT.address} deposit usdt`, async () => {
  return await everpay.deposit({
    tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
    amount: '0.01'
  }).then(ethTx => {
    console.log('ethTx', ethTx)
    expect(ethTx).toBeTruthy()
  })
})

// test(`check ${ethWalletHasUSDT.address} deposit usdt`, async () => {
//   return await everpay.deposit({
//     chainType: ChainType.ethereum,
//     symbol: 'usd',
//     amount: '1000'
//   }).then(usdtTx => {
//     console.log('usdtTx', usdtTx)
//     expect(usdtTx).toBeTruthy()
//   })
// })
