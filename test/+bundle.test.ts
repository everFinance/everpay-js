import Everpay from '../src/index'
import { ethWalletHasUSDT, arWallet1 } from './constants/wallet'
import { ethers } from 'ethers'
import { genTokenTag } from '../src/utils/util'
import hashPersonalMessage from '../src/lib/hashPersonalMessage'
import Arweave from 'arweave'
import { b64UrlToBuffer } from 'arweave/web/lib/utils'
import { ChainType } from '../src/types'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpayEthAccount = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  chainType: ChainType.ethereum,
  debug: true
})

const everpayArAccount = new Everpay({
  account: arWallet1.address,
  arJWK: arWallet1.jwk,
  chainType: ChainType.arweave,
  debug: true
})

describe('test bundle data generate & sign', () => {
  test('test bundle data generate', async () => {
    const everpayInfo = await everpayArAccount.info()
    const bundleData = await everpayArAccount.getBundleData([
      {
        tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
        from: ethWalletHasUSDT.address,
        to: arWallet1.address,
        amount: '0.001'
      }, {
        tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
        from: arWallet1.address,
        to: ethWalletHasUSDT.address,
        amount: '10'
      }
    ])

    expect(bundleData.items[0].tag).toBe(genTokenTag(everpayInfo.tokenList.find(t => t.symbol.toUpperCase() === 'ETH')))
    expect(bundleData.items[1].tag).toBe(genTokenTag(everpayInfo.tokenList.find(t => t.symbol.toUpperCase() === 'TUSDC')))
  })

  test('test sign bundle data', async () => {
    const bundleData = await everpayArAccount.getBundleData([
      {
        tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
        from: ethWalletHasUSDT.address,
        to: arWallet1.address,
        amount: '0.001'
      }, {
        tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
        from: arWallet1.address,
        to: ethWalletHasUSDT.address,
        amount: '10'
      }
    ])
    const bundleDataWithSigs1 = await everpayArAccount.signBundleData(bundleData)
    const bundleDataWithSigs2 = await everpayEthAccount.signBundleData(bundleDataWithSigs1)

    const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(JSON.stringify(bundleData)))
    const arweave = Arweave.init(options)
    const verified1 = await arweave.crypto.verify(
      arWallet1.jwk.n,
      personalMsgHashBuffer,
      b64UrlToBuffer(bundleDataWithSigs2.sigs[arWallet1.address].split(',')[0])
    )
    expect(verified1).toBe(true)

    const recoveredAddress = await ethers.utils.verifyMessage(JSON.stringify(bundleData), bundleDataWithSigs2.sigs[ethWalletHasUSDT.address])
    expect(recoveredAddress.toLowerCase()).toBe(ethWalletHasUSDT.address.toLowerCase())
  })

  test('send bundle tx', async () => {
    const bundleData = await everpayArAccount.getBundleData([
      {
        tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
        from: ethWalletHasUSDT.address,
        to: arWallet1.address,
        amount: '0.001'
      }, {
        tag: 'bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712',
        from: arWallet1.address,
        to: ethWalletHasUSDT.address,
        amount: '10'
      }
    ])
    const bundleDataWithSigs1 = await everpayArAccount.signBundleData(bundleData)
    const bundleDataWithSigs2 = await everpayEthAccount.signBundleData(bundleDataWithSigs1)

    const bundleResult = await everpayArAccount.bundle({
      tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
      to: arWallet1.address,
      amount: '0',
      data: {
        bundle: bundleDataWithSigs2
      }
    })
    expect(bundleResult.status).toBe('ok')

    const everpayTransaction = await everpayArAccount.txByHash(bundleResult.everHash)
    expect(JSON.parse(everpayTransaction.internalStatus).status).toBe('success')
  })
})
