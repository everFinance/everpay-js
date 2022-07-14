import Everpay, { ChainType } from '../src/index'
import { ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'

const providerURL = 'https://evmtestnet.confluxrpc.com'
// Define Provider
const provider = new ethers.providers.StaticJsonRpcProvider(providerURL, {
  chainId: 71,
  name: 'Conflux eSpace (Testnet)'
})
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  chainType: ChainType.conflux,
  ethConnectedSigner: signer,
  debug: true
})

test(`check Conflux ${ethWalletHasUSDT.address} deposit cfx`, async () => {
  return await everpay.deposit({
    tag: 'conflux-cfx-0x0000000000000000000000000000000000000000',
    amount: '0.01'
  }).then(ethTx => {
    console.log('ethTx', ethTx)
    expect(ethTx).toBeTruthy()
  })
})
