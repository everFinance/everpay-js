# everpay-js

## 参数
```ts
const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: address,
  // true 使用 everpay 开发环境, false 或者不传递，使用 everpay 正式环境
  debug: true,
  // etherjs connected signer
  // 可以不传递，如果不传递，只能使用 everpay 最基础的查询接口
  connectedSigner: signer,
})
```

## 查询类接口
### info
```ts
const info = await everpay.info()
```

### balance
```ts
const balance = await everpay1.balance({
  chainType: 'ethereum',
  symbol: 'eth',
  // account 可不传递，默认查询当前账户下对应 symbol 余额；如果传递，即查询该 acount 对应symbol 余额
  account,
})
```

### txs
查询 everpay 上的所有交易记录

```ts
await everpay.txs()
```
### txsByAccount
查询 everpay 上对应 account 下的交易记录

```ts
// account 可不传递，默认为当前账户
await everpay.txsByAccount(account)
```
## 操作类接口
**注意**：everpay 实例创建时，必须传递 connectedSigner 才可调用操作类接口

### deposit
```ts
// ETH
await everpay.deposit({
  chainType: ChainType.ethereum,
  symbol: 'eth',
  amount: 100
})

// erc20
await everpay.deposit({
  chainType: ChainType.ethereum,
  symbol: 'usdt',
  amount: 100
})
```

### withdraw
```ts
// ETH
await everpay.withdraw({
  chainType: ChainType.ethereum,
  symbol: 'eth',
  amount: 100,
  // to 可不传递，默认为当前账户
  to,
})

// erc20
await everpay.withdraw({
  chainType: ChainType.ethereum,
  symbol: 'usdt',
  amount: 100,
  // to 可不传递，默认为当前账户
  to,
})
```

### transfer
```ts
// ETH
await everpay.transfer({
  chainType: ChainType.ethereum,
  symbol: 'eth',
  amount: 100,
  to,
})

// erc20
await everpay.transfer({
  chainType: ChainType.ethereum,
  symbol: 'usdt',
  amount: 100,
  to,
})
```