import Everpay, { ChainType } from '../src/index'
import { ethWalletHasUSDT } from './constants/wallet'
import { ethers } from 'ethers'

const providerURL = 'https://rpc.api.moonbase.moonbeam.network'
// Define Provider
const provider = new ethers.providers.StaticJsonRpcProvider(providerURL, {
  chainId: 1287,
  name: 'moonbase-alphanet'
})
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  chainType: ChainType.moon,
  ethConnectedSigner: signer,
  debug: true
})

test(`check moonbase ${ethWalletHasUSDT.address} deposit dev`, async () => {
  return await everpay.deposit({
    tag: 'moonbase-dev-0x0000000000000000000000000000000000000000',
    amount: '0.01'
  }).then(ethTx => {
    console.log('ethTx', ethTx)
    expect(ethTx).toBeTruthy()
  })
})
