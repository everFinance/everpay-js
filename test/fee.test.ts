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
  return await everpay.fee('arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0xcc9141efa8c20c7df0778748255b1487957811be').then(fee => {
    expect(fee.burnFeeMap.arweave).toBeTruthy()
  })
})
