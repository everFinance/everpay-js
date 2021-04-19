import Everpay from '../src/index'

const everpay = new Everpay({
  account: '0xa06b79E655Db7D7C3B3E7B2ccEEb068c3259d0C9',
  debug: true
})

export default async (): Promise<void> => {
  const info = await everpay.info()
  console.log('info', info)
}
