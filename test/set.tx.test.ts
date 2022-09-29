import { ethers } from 'ethers'
import { ethWalletSet } from './constants/wallet'
import Everpay, { NewToken, TargetChainMeta } from '../src'
const provider = new ethers.providers.InfuraProvider('kovan')

test('add token set', async () => {
  const signer = new ethers.Wallet(ethWalletSet.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletSet.address,
    ethConnectedSigner: signer,
    debug: true
  })

  const newToken: NewToken = {
    tokenID: '0xb5EadFdbDB40257D1d24A1432faa2503A867C270',
    symbol: 'DDD',
    chainType: 'bsc',
    chainID: '97',
    everDecimals: 18,
    targetChains: [
      {
        targetChainId: '97',
        targetChainType: 'bsc',
        targetDecimals: 18,
        targetTokenId: '0xb5EadFdbDB40257D1d24A1432faa2503A867C270'
      }
    ]
  }
  const ats = await everpay.signAddTokenSet(newToken)
  const res = await everpay.setTx(ats)
  console.log(res)
})

test('add target chain', async () => {
  const signer = new ethers.Wallet(ethWalletSet.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletSet.address,
    ethConnectedSigner: signer,
    debug: true
  })
  const tokenTag = 'bsc-ddd-0xb5eadfdbdb40257d1d24a1432faa2503a867c270'
  const targetChain: TargetChainMeta = {
    targetChainId: '1287',
    targetChainType: 'moon',
    targetDecimals: 18,
    targetTokenId: '0x1930fD66A3faea9B8e7F120d735BB431C048Ad26'
  }
  const atc = await everpay.signAddTargetChainSet(tokenTag, targetChain)
  const res = await everpay.setTx(atc)
  console.log(res)
})

test('set token display', async () => {
  const signer = new ethers.Wallet(ethWalletSet.privateKey, provider)
  const everpay = new Everpay({
    account: ethWalletSet.address,
    ethConnectedSigner: signer,
    debug: true
  })

  const tokenTag = 'bsc-ddd-0xb5eadfdbdb40257d1d24a1432faa2503a867c270'
  const display = true
  const td = await everpay.signTokenDisplaySet(tokenTag, display)
  const res = await everpay.setTx(td)
  console.log(res)
})
