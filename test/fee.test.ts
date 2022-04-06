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
  return await everpay.fee('ar').then(fee => {
    expect(fee.burnFeeMap.arweave).toBeTruthy()
  })
})
