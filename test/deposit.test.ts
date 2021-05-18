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

test(`check ${ethWalletHasUSDT.address} deposit usdt`, async () => {
  return await everpay.deposit({
    chainType: ChainType.ethereum,
    symbol: 'usdt',
    amount: 1000
  }).then(usdtTx => {
    console.log('usdtTx', usdtTx)
    expect(usdtTx).toBeTruthy()
  })
})
