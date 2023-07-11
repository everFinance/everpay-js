import ethereumLib from '../src/lib/ethereum'
import { ethWalletHasUSDT } from './constants/wallet'

import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

test('check arweaveLib.signMessageAsync', async () => {
  const message = 'hello world'
  const signature = await ethereumLib.signMessageAsync(signer, ethWalletHasUSDT.address, message)
  const recoveredAddress = await ethers.utils.verifyMessage(message, signature)
  expect(recoveredAddress.toLowerCase()).toBe(ethWalletHasUSDT.address.toLowerCase())
})
