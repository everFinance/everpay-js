import * as fs from 'fs'
import * as path from 'path'
import csvParser from 'csv-parser'
import { getEverpayBalance } from '../api'
import { getEverpayHost } from '../config'
import { ChainType } from '../global'

interface Item {
  address: string // address
  balance: string // balance
}

const getOriData = async (): Promise<Item[]> => {
  return await new Promise(resolve => {
    const results: Item[] = []
    fs.createReadStream(path.resolve(process.cwd(), './src/checkBalance/beta_balances.csv'))
      .pipe(csvParser({ headers: false }))
      .on('data', (data) => {
        results.push({
          address: data[0],
          balance: data[1]
        })
      })
      .on('end', () => {
        resolve(results)
      })
  })
}

const checkBalance = async (): Promise<void> => {
  const oriData = await getOriData()
  console.log('oriData', oriData)
  const wrongBalances: any[] = []
  for (const item of oriData) {
    const newItem = await getEverpayBalance(getEverpayHost(false), {
      chainType: ChainType.ethereum,
      symbol: 'ETH',
      id: '0x' + '0'.repeat(40),
      account: item.address
    })
    console.log('newItem', newItem)
    if (item.balance !== newItem.balance) {
      wrongBalances.push({
        ori: item,
        cur: newItem
      })
      console.log('failed:' + item.address)
    }
  }

  if (wrongBalances.length > 0) {
    fs.writeFileSync(path.resolve(process.cwd(), './src/checkBalance/wrong_balances.json'), JSON.stringify(wrongBalances))
    console.log('check faild!')
  } else {
    console.log('check success!')
  }
}

checkBalance()
  .then(() => {
    console.log('done')
  })
  .catch(e => {
    console.log(e)
  })
