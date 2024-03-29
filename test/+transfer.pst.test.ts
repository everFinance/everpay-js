import Everpay from '../src/index'
import { arWallet2, ethWalletHasUSDT } from './constants/wallet'
import { ChainType } from '../src/types'

test(`${arWallet2.address} transfer VRT to ${ethWalletHasUSDT.address}`, async () => {
  const everpay = new Everpay({
    account: arWallet2.address,
    arJWK: arWallet2.jwk,
    chainType: ChainType.arweave,
    debug: true
  })

  return await everpay.transfer({
    tag: 'arweave-vrt-usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A',
    amount: '0.000010001',
    to: ethWalletHasUSDT.address
  }).then(withdrawResult => {
    console.log('withdrawResult', withdrawResult)
    expect(withdrawResult.status).toBe('ok')
  })
})
