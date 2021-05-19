import Arweave from 'arweave'
import arweaveLib from '../src/lib/arweave'
import { arWallet1 } from './constants/wallet'

const options = {
  host: 'arweave.net', // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: 'https', // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false // Enable network request logging
}

test('check arweaveLib.signMessageAsync', async () => {
  const dataBuf = Buffer.from('helloworldhelloworldhellow')
  const msgBase64 = await arweaveLib.signMessageAsync(arWallet1.jwk, dataBuf)

  const arweave = Arweave.init(options)
  const verified = await arweave.crypto.verify(arWallet1.jwk.n, dataBuf, Buffer.from(msgBase64, 'base64'))
  expect(verified).toBe(true)
})
