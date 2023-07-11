import Everpay from '../src/index'
import { ethWalletHasUSDT, ethWalletHasUSDT2 } from './constants/wallet'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  debug: true
})

test(`check ${ethWalletHasUSDT.address} transfer usdt to ${ethWalletHasUSDT2.address}`, async () => {
  return await everpay.transfer({
    tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
    amount: '5.26',
    to: '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo',
    data: { hello: 'world', this: 'is everpay' }
  }).then(transferResult => {
    console.log('transfer usdt result', transferResult)
    expect(transferResult.status).toBe('ok')
  })
})
