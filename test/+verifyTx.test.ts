import Everpay from '../src/index'

const everpay = new Everpay()

const evmTx = {
  rawId: 1720,
  id: 'FmFaumR-4inMH-DMH1v50KFhTTbICIYMq7r99zoaIKY',
  tokenSymbol: 'ETH',
  action: 'bundle',
  from: '0x26361130d5d6E798E9319114643AF8c868412859',
  to: '5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo',
  amount: '0',
  fee: '0',
  feeRecipient: '0x6451eB7f668de69Fb4C943Db72bCF2A73DeeC6B1',
  nonce: 1679580546731,
  tokenID: '0x0000000000000000000000000000000000000000',
  chainType: 'ethereum',
  chainID: '5',
  data: '{"bundle":{"items":[{"tag":"bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712","chainID":"97","from":"0x26361130d5d6E798E9319114643AF8c868412859","to":"5NPqYBdIsIpJzPeYixuz7BEH_W7BEk_mb8HxBD3OHXo","amount":"1000"},{"tag":"bsc-tusdc-0xf17a50ecc5fe5f476de2da5481cdd0f0ffef7712","chainID":"97","from":"0x26361130d5d6E798E9319114643AF8c868412859","to":"3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM","amount":"10000000"}],"expiration":1679580584,"salt":"a3fff847-aa14-48cf-bd12-86015a35d9cc","version":"v1","sigs":{"0x26361130d5d6E798E9319114643AF8c868412859":"0x879b69175b5cfdec1bcf56587bc5553f1bd40681780a21f714fb6c5631ac1a522d2bda7741b66a4dc6ff0b607323993cf460d50ca83843546eefdc6ddfa618381b"}}}',
  version: 'v1',
  sig: '0x80899a58c595cc681bebe6388e695cfeefc53703121b1c4ecdaf8c57cd38f46972526af9c57a3dc81f7f5bc5becedc90583e80cd6af93a7fdbd94d2991bfc8291b',
  everHash: '0x7abbb410067c308db94844ff6f0ec6f15de544b7e57e2db211c5f8586f083f88',
  status: 'packaged',
  internalStatus: '{"status":"success"}',
  timestamp: 1679583045000,
  targetChainTxHash: '',
  express: {
    chainTxHash: '',
    withdrawFee: '',
    refundEverHash: '',
    err: ''
  }
}

const arTx = {
  rawId: 2743,
  id: 'UanoRJAr2PAI56Ujn5PqrI9c-v6usZ4rNKTZlW9zyDk',
  tokenSymbol: 'U',
  action: 'burn',
  from: '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM',
  to: '3tot2o_PcueolCwU0cVCDpBIuPC2c5F5dB0vI9zLmrM',
  amount: '1',
  fee: '0',
  feeRecipient: '0xfAC49e12F19743FFc3A756294f1bf70C282E25fA',
  nonce: 1687666065936,
  tokenID: 'KTzTXT_ANmF84fWEKHzWURD1LWd9QaFR9yfYUwH2Lxw',
  chainType: 'arweave',
  chainID: '99',
  data: '{"targetChainType":"arweave"}',
  version: 'v1',
  sig: 'HsyxONWYQA5kZBjPYBL5OH-KMHvEYpRJZmgzTrDl_3rITMvibPUSadNI5KmBKdNKthFOUipOxfxFZbFuynqI-P121DquxWsSLJDrZiJzkZJU69qWF4x9_XOWRWdGAg8GVrdKYtBSBPgCh7sP3HEHerxY78UTzPuwzqOWYUZ5DZOSK8ozuAVCw82QsgvzVxJv38pwYz-SiIAQMFKNiGdJjRqvJ4M37rw6K0rW5a-3PRbQzYnIAUdygeW-JmInKXG1yfCDWanUJEpH6nbXr2SISgd2QfBApcLZK4Tvo-OLeKiLQawnVqouMBhbVKwnS1_lCKfiWsT0q4bPJwEAqRORV68bFhFCsqX-0dC060uGB5ZvXm0juFmVF2mnVYx4JrijOCgqZcwrfUSVQ-QeyW1IVhNZfSuRHsra9i7Ru84Q3h5Dmi6vdYfvQYBa3X0zmA5tFWju6v_-u-bb3eaI4iOgh-xny8IDCCAliNjq9UkIDQLp8p72qe793dSAkU8Tp-_DOxFqWaw6OGMTI7V9pgA1vBZYdUr980cNohB5dVyDd321TTuAP8LU5INyIkZHUpJy4B495Dl-Gbe2XTgPKOx-qe8FUPq2F-VSj_mKXK7Mzvu3DH_doTzcWFIPiqm0vYW89IBqbFinhv031Un3FtlZC43E-cQ3UcCrCb2F1FyUHrU,5oZAXKfBfZ32JIKSIUksXO6K27T9gnbJCnndpGTvKf1HFUh5uh1y38Zcxwn8D5hhOfgWoonVmWcuxvNBw3LaW4q7NUEu72ukg0KpaipGOqVvzChsP4MuD79mXgQd_N-J18MT51mO3uGwiMLJUohkWT_XkhSDSsPyJoS9xhoRZN9OseDB-4cIkevfIyewrBpmX6wSZ7yBf6lml5btAi57Aha-DvhUSEKV0mtsx7C81jf1Aw8B639zPomT7eYYRWepkGwfQ7_JZMJ7ddAC0hEUpTDcmBe20k5i9XzlmqB1bFIu236BrswD-xVTGvWidrEVTUafL8jOpSML875iOKGgC_y6aCgwMgTxemneWNgsUjkSOvi24fPxpGoFFzcRPWnQ1Ru5Wuw6RqO5RlVpvEvztXEE5IprXWdP286lgLTzcduagT4dHouhDrMaIP68lq17u2p3RaU2Awgn4kOQA-p8_iVESj9hPlLwhbQ48I46Vh2Eq6SgJffvr-mYqOY6jJB3AttsftMk8zxhmMl20nDT0RbKNGkKicezjbxXi9Pp2j4s_H_ynvrNvFWj_JS3wHITuX_vKcYFxgmExcpTa4FQsuwBeZxI2Ls9g4kkIM-CcXDwfp-aQ4JIpfWLWt5MKKx5ouhOXBQa5GvNs3YR3imhUTv1FOpm9n_jscWxwZJMTls',
  everHash: '0x31564983bef2866d6c62f3cc56d176c60e74b2a5bfd59bb4eeba6ba876a60f5c',
  status: 'packaged',
  internalStatus: '{"status":"success"}',
  timestamp: 1687667066000,
  targetChainTxHash: 'jDnDIVVRiLNlFshZyq4wn5dH3AdvpsJProbkcanDe3U',
  express: {
    chainTxHash: '',
    withdrawFee: '',
    refundEverHash: '',
    err: ''
  }
}

test('everpey evm tx', async () => {
  return await everpay.verifyTx(evmTx as any).then(verifid => {
    expect(verifid).toBe(true)
  })
})

test('everpey ar tx', async () => {
  return await everpay.verifyTx(arTx as any).then(verifid => {
    expect(verifid).toBe(true)
  })
})
