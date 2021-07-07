import Everpay from '../src/index'
import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/types'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  debug: true
})

test(`check ${ethWalletHasUSDT.address} transfer usdt to ${ethWalletHasUSDT2.address}`, async () => {
  return await everpay.transfer({
    chainType: ChainType.ethereum,
    symbol: 'usdt',
    amount: '9',
    to: ethWalletHasUSDT2.address
  }).then(transferResult => {
    console.log('transfer usdt result', transferResult)
    expect(transferResult.status).toBe('ok')
  })
})
