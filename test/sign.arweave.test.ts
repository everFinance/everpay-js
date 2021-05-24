import Arweave from 'arweave'
import arweaveLib from '../src/lib/arweave'
import { hashPersonalMessage } from 'ethereumjs-util'
import { getEverpayTxMessage } from '../src/lib/sign'
import { b64UrlToBuffer } from 'arweave/web/lib/utils'
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

test('check exist test data', async () => {
  const json = { tokenSymbol: 'USDT', action: 'transfer', from: '5npqybdisipjzpeyixuz7beh_w7bek_mb8hxbd3ohxo', to: '0x26361130d5d6e798e9319114643af8c868412859', amount: '1000000', fee: '0', feeRecipient: '0x6451eb7f668de69fb4c943db72bcf2a73deec6b1', nonce: '1621849358202', tokenID: '0xd85476c906b5301e8e9eb58d174a6f96b9dfc5ee', chainType: 'ethereum', chainID: '42', data: '{"arOwner":"odtNk97a4PARR0I8g3kQpzlFVmPg-udyjfl81fbTioyP2pEw5tP5A1-FVqR-QFFPskW-j7yAze5usYNWHEir7oVQ9d9bbkcZIDEPqwSTO1JoD1BKXeeBK0xsmiSgxeY7uuRXWdhXREhlmIMsV8ObakEeXdbbxbs89XaZHBuES7boASrRVDXRz_mhMu6u_58OdLeMwR3I1BCH6nphNGVOehA7GOOqEBvtesBset0bNaLCb0JpSg5ZW_0AGLP-XydzE3IPLLx4NQEEJY21y8fChxYM4jntI78l5hojp9NlmS69EXlj0PoMjsbaWaz9WtnZaMAbnaOGAHhv8Y_TNmBI0FHpqHaGPP906Mnrgdm3tl2L40EX-Q6-liNVkB56CmPxXzSesu-4x5LLYxQ-aX3W6Hj7RCDTacxqUJHzOrhJqXSx6Jx0t8CwyfReMgVv4p5t1C3OZ8yYbJ_H3LdkeriVniaC5jQdMyIJ6QBMzr1XdXIw9WuEG2kCIYtvOp2qDuu9o2SY-9W4Yv7VWRDfWO38xxR4ZO65MMAdZxeaZ4w8sK_owH46Wm0XoT3Al-LPypaeijWqlHEu4R8c2ersD3xkDvXC_lNtaQw_qyfI3UEH5fWupY4zhZeDGkvXQh32Fv4CxlZL58iUHv9SvR7p5LgBCC3AVUbn7Sqc4xPUCZMj-Tc"}', version: 'v1' }
  const message = getEverpayTxMessage(json as any)
  const personalMsgMash = hashPersonalMessage(Buffer.from(message))
  const dataBuf = personalMsgMash
  const msgBase64 = 'FPKBn1Nd3eshEP8C3ct8oqzi60VkpE1hDwXsLW9tOdDEOYkKaZ5OCjJWISY1zGnNTb9maj3GGxQkPCMITV12D8bNbGFo+Le/xlnyhXkXth+txqXnq8xzoCXmusVkdgcqF5jOg2wLes/6n94qXMnXqGct8yEDYfkq0vs9asexOHfE6Vep9IcgrpQfUTkTJnr1Uk+pK0x2LFAHrfzjilJvmNFmTj170iWAbnSQaWUSHsNlWp+Ku79SG7SaUudJj2EC+QN/KLdGQB6u+dicj0j8s25ARLcEUO0aq0vk+Xg3uZVm4oCpQmvlCkz8u50yWxtZDzrG3vaciMto2kMrNWDetMLw9gFYz7MbiqsQ4Eo0pjKu/QpEl74l9ReWn0vDY06wwC9HDhMozyi9p+aNtv20DnZWdv34YXpH5qs/1JMSHWE0Zzl+OOcOrpQI2KBw8PYa/iaNk7LLVD5ZlizHdOi1diIoHXNi7aBeIqjCnodTdRnzyotqMZwdynFBLYVmSe+iTxTmBjMrU0Iq7uFuoEBmUOV+bi9iN65taH9ZxVH2Rt2Msk0Ql4wmL55GnIF09H9nRh0/gc3A7hpqV44jrKWXq806xqLOpZfz6DEvDTm8N/L4aqOfhhShZKUqa3ru9CBazh8OZiOMdnZqpOyDB998h9A8TMufW1+YbirTJZBJ4Iw='

  const arweave = Arweave.init(options)
  const verified = await arweave.crypto.verify(arWallet1.jwk.n, dataBuf, Buffer.from(msgBase64, 'base64'))
  expect(verified).toBe(true)
})

test('check exist test data2 using arweave to string to base64', async () => {
  const json = { tokenSymbol: 'ETH', action: 'transfer', from: '5npqybdisipjzpeyixuz7beh_w7bek_mb8hxbd3ohxo', to: '0x26361130d5d6e798e9319114643af8c868412859', amount: '1000000000000000000', fee: '0', feeRecipient: '0x6451eb7f668de69fb4c943db72bcf2a73deec6b1', nonce: '1621851662873', tokenID: '0x0000000000000000000000000000000000000000', chainType: 'ethereum', chainID: '42', data: '{"arOwner":"odtNk97a4PARR0I8g3kQpzlFVmPg-udyjfl81fbTioyP2pEw5tP5A1-FVqR-QFFPskW-j7yAze5usYNWHEir7oVQ9d9bbkcZIDEPqwSTO1JoD1BKXeeBK0xsmiSgxeY7uuRXWdhXREhlmIMsV8ObakEeXdbbxbs89XaZHBuES7boASrRVDXRz_mhMu6u_58OdLeMwR3I1BCH6nphNGVOehA7GOOqEBvtesBset0bNaLCb0JpSg5ZW_0AGLP-XydzE3IPLLx4NQEEJY21y8fChxYM4jntI78l5hojp9NlmS69EXlj0PoMjsbaWaz9WtnZaMAbnaOGAHhv8Y_TNmBI0FHpqHaGPP906Mnrgdm3tl2L40EX-Q6-liNVkB56CmPxXzSesu-4x5LLYxQ-aX3W6Hj7RCDTacxqUJHzOrhJqXSx6Jx0t8CwyfReMgVv4p5t1C3OZ8yYbJ_H3LdkeriVniaC5jQdMyIJ6QBMzr1XdXIw9WuEG2kCIYtvOp2qDuu9o2SY-9W4Yv7VWRDfWO38xxR4ZO65MMAdZxeaZ4w8sK_owH46Wm0XoT3Al-LPypaeijWqlHEu4R8c2ersD3xkDvXC_lNtaQw_qyfI3UEH5fWupY4zhZeDGkvXQh32Fv4CxlZL58iUHv9SvR7p5LgBCC3AVUbn7Sqc4xPUCZMj-Tc"}', version: 'v1' }
  const message = getEverpayTxMessage(json as any)
  const personalMsgMash = hashPersonalMessage(Buffer.from(message))
  const dataBuf = personalMsgMash
  const msgBase64 = 'JGlmDRvOUJsG7lvfTzw2tKSzlprJkYM20fvTH9HJXyNeJ4twMyQWPi1puUPU5Ur-ReNgAO1kLV9gsgXWmrrr7DDkXxO1hVCBIB2wfWzloz8Varw-n_ojzqS9CmRt95uzrLT0PkefTtp0RXlVZ4ObIW4PzrJwJaawgtmx2Bbr8cd0fA6jeqZpKz4q3IhfR3kuiwFuOClXkIMwawfAL5czwW0JC_CoywVx12ZV701mx2O9EkyswsYcpHbJebfSMRRnHJ4pDGCmQp8cqvJOStWn5yPvhcRWctB-sk7mbUyU3JgnZm8BtWC6omPyEljofXnrDrQ-sNZS0r8wqGl5SvGWh5Xu5L3Ll5tOJGFsxbe11af5IBPbVuuNtztkQC3v3wY4X7t_Ia8pluXzJRkS2rlC9DBprZYqKjv2RDr6gD9985TM8fsJsmZy9PYMdEHqNj6a0DVGgvQABo6PptwjoNKX_oDrxkQlTll-ce5oEqdptP5lQd5snZH4Vs6r36fZh0vfGGidWhHHYjhcqnunx_nyjkFLj8eHi_XzICt_JyD1JQTxLmy4VOYMh37PH3bslOeQhNff5Y46OBi-VlccDxarwgYLNVeDIiAoKLsbBpV8yMuyUVm4xgEg5W38-uqhGiipnGtGZgU2tDuR7-D6F5poiUqOWpJzEcFtilJDfo9XOLE'

  const arweave = Arweave.init(options)
  const verified = await arweave.crypto.verify(arWallet1.jwk.n, dataBuf, b64UrlToBuffer(msgBase64))
  expect(verified).toBe(true)
})
