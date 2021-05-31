import createKeccakHash from 'keccak'
import { Hash } from 'crypto'

function createHashFunction (
  hashConstructor: () => Hash
): (msg: Buffer) => Buffer {
  return msg => {
    const hash = hashConstructor()
    hash.update(msg)
    return Buffer.from(hash.digest())
  }
}

const keccak256 = createHashFunction((): Hash => {
  return createKeccakHash('keccak256') as Hash
})

// cp from: https://github.com/ethereumjs/ethereumjs-util/blob/ebf40a0fba8b00ba9acae58405bca4415e383a0d/src/signature.ts#L168
const hashPersonalMessage = function (message: Buffer): Buffer {
  const prefix = Buffer.from(
    `\u0019Ethereum Signed Message:\n${message.length.toString()}`,
    'utf-8'
  )
  return keccak256(Buffer.concat([prefix, message]))
}

export default hashPersonalMessage
