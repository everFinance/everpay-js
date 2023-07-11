import Everpay from '../src/index'

const everpay = new Everpay({
  debug: true
})

test('everpey fees got correct', async () => {
  return await everpay.fees().then(fees => {
    expect(fees.length).toBeGreaterThan(0)
    expect(fees.find(t => t.tokenTag.toLowerCase().includes('ethereum'))).toBeTruthy()
  })
})

test('everpey fee got correct', async () => {
  return await everpay.fee('arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x83ea4a2fe3ead9a7b204ab2d56cb0b81d71489c8').then(fee => {
    expect(fee.burnFeeMap.arweave).toBeTruthy()
  })
})
