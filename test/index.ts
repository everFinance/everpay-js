import info from './info'
import balance from './balance'

const run = async (): Promise<void> => {
  for (const func of [info, balance]) {
    await func()
  }
}

run().finally(() => {
  console.log('done')
})
