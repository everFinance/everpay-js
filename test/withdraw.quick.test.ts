import Everpay from '../src/index'
import { ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'
import { ChainType } from '../src/types'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

test(`${ethWalletHasUSDT.address} withdraw USDT to ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: ethWalletHasUSDT.address,
    ethConnectedSigner: signer,
    debug: true
  })

  return await everpay.withdraw({
    chainType: ChainType.ethereum,
    symbol: 'usdt',
    amount: '99',
    quickMode: true
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
