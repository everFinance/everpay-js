import Everpay from '../src/index'
import { ethWalletHasUSDT, arWallet1 } from './constants/wallet'
import { ethers } from 'ethers'

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpayEVM = new Everpay({
  debug: true,
  account: ethWalletHasUSDT.address,
  chainType: 'ethereum' as any,
  ethConnectedSigner: signer
})

const everpayAR = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  chainType: 'arweave' as any,
  debug: true
})

describe('signMessage for EVM', () => {
  test('signMessage EVM should be OK', async () => {
    const message = 'verify'
    const signResult = await everpayEVM.signMessage(message)
    expect(signResult.message).toBe(message)
    return await everpayEVM.verifyMessage({
      type: 'sign',
      message,
      account: ethWalletHasUSDT.address,
      sig: signResult.sig
    }).then(result => {
      expect(result.public).toBeTruthy()
      expect(result.publicId.toLowerCase()).toBe(ethWalletHasUSDT.address.toLowerCase())
    })
  })
})

describe('signMessage for Arweave', () => {
  test('signMessage for Arweave should be OK', async () => {
    const account = arWallet1.address
    const message = 'verify'
    const signResult = await everpayAR.signMessage(message)
    expect(signResult.message).toBe(message)
    return await everpayAR.verifyMessage({
      type: 'sign',
      message,
      account,
      sig: signResult.sig
    }).then(result => {
      expect(result.public).toBeTruthy()
      expect(result.publicId.toLowerCase()).toBe(account.toLowerCase())
    })
  })
})
