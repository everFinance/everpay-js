import { Signer } from 'ethers'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { PostEverpayTxResult } from './api'
import { TransactionResponse as EthereumTransaction } from '@ethersproject/abstract-provider'
import { TransactionInterface as ArweaveTransaction } from 'arweave/node/lib/transaction'

export enum ChainType {
  ethereum = 'ethereum',
  moon = 'moon',
  arweave = 'arweave',
  conflux = 'conflux',
  bsc = 'bsc',
  platon = 'platon'
}

export type ArJWK = JWKInterface | 'use_wallet'

export { EthereumTransaction, ArweaveTransaction }

export interface Config {
  debug?: boolean
  account?: string
  chainType?: ChainType
  ethConnectedSigner?: Signer
  arJWK?: ArJWK
}

export interface CrossChainInfo {
  targetChainId: string
  targetChainType: ChainType
  targetDecimals: number
  targetTokenId: string
}

export interface Token {
  tag: string
  id: string
  symbol: string
  decimals: number
  totalSupply: string
  chainID: string
  chainType: ChainType | string
  crossChainInfoList: {
    [propname: string]: CrossChainInfo
  }
}

export interface FeeItem {
  tokenTag: string
  burnFeeMap: {
    [propname: string]: string
  }
  transferFee: string
  atomicBundleFee: string
  updatedAt: string
}

export interface EverpayInfo {
  lockers: {
    [propName: string]: string
  }
  ethChainID: string
  feeRecipient: string
  owner: string
  everRootHash: string
  rootHash: string
  tokenList: Token[]
}

interface ExpressTokenItem {
  tokenTag: string
  withdrawFee: string
  walletBalance: string
}
export interface ExpressInfo {
  address: string
  withdrawTimeCost: number
  tokens: ExpressTokenItem[]
}

export enum EverpayAction {
  transfer = 'transfer',
  withdraw = 'burn',
  bundle = 'bundle'
}

export interface InternalTransferItem {
  symbol: string
  from: string
  to: string
  amount: string
}

export interface BundleItem {
  amount: string
  chainID: string
  from: string
  to: string
  tag: string
}

export interface BundleData {
  items: BundleItem[]
  expiration: number
  salt: string
  version: string
}

export interface BundleDataWithSigs extends BundleData {
  sigs: {
    [account: string]: string
  }
}

export interface EverpayTxWithoutSig {
  tokenSymbol: string
  action: EverpayAction
  from: string
  to: string
  amount: string
  fee: string
  feeRecipient: string
  nonce: string
  tokenID: string
  chainType: ChainType | string
  chainID: string
  data: string
  version: string
}

export interface EverpayTx extends EverpayTxWithoutSig {
  sig: string
}

export enum EverpayActionWithDeposit {
  transfer = 'transfer',
  withdraw = 'burn',
  deposit = 'mint',
  bundle = 'bundle'
}

enum EverpayTransactionStatus {
  // deposit 下，经过 6 个区块 everPay confirm
  // mint、burn，后端接收到信息，会先 confirmed
  confirmed = 'confirmed',
  // JSON 文件存储交易打包完成，变成 packaged
  packaged = 'packaged'
}

export interface EverpayTransaction {
  // a transaction that everpay json saved to ar
  id: string
  tokenSymbol: string
  nonce: number
  action: EverpayActionWithDeposit
  from: string
  to: string
  amount: string
  data: string
  fee: string
  feeRecipient: string
  sig: string
  everHash: string
  status: EverpayTransactionStatus
  internalStatus: string
  timestamp: number
  targetChainTxHash?: string
  express: {
    chainTxHash: string
    withdrawFee: string
    refundEverHash: string
    err: string
  }
}

export interface TxsResult {
  accid?: string
  currentPage: number
  totalPages: number
  txs: EverpayTransaction[]
}

export interface BalanceParams {
  symbol: string
  account?: string
}

export interface BalancesParams {
  account?: string
}

export interface BalanceItem {
  chainType: string
  symbol: string
  balance: string
  address: string
}

export interface DepositParams {
  symbol: string
  amount: string
}

export interface WithdrawParams {
  chainType: ChainType
  symbol: string
  amount: string
  fee?: string
  quickMode?: boolean
  data?: Record<string, unknown>
  to?: string
}

export interface TransferParams {
  symbol: string
  amount: string
  data?: Record<string, unknown>
  to: string
}

export interface BundleParams {
  symbol: string
  amount: string
  data: {
    bundle: BundleDataWithSigs
  }
  to: string
}

export interface TxsParams {
  page?: number
  symbol?: string
  action?: EverpayActionWithDeposit
  withoutAction?: EverpayActionWithDeposit
}

export interface TxsByAccountParams {
  page?: number
  account?: string
  symbol?: string
  action?: EverpayActionWithDeposit
}

export interface SendEverpayTxResult extends PostEverpayTxResult {
  everpayTx: EverpayTx
  everHash: string
}

export interface CachedInfo {
  everpay?: {
    value: EverpayInfo
    timestamp: number
  }
  express?: {
    value: ExpressInfo
    timestamp: number
  }
}

export abstract class EverpayBase {
  abstract getAccountChainType (address: string): ChainType
  abstract info (): Promise<EverpayInfo>
  abstract expressInfo (): Promise<ExpressInfo>
  abstract balance (params?: BalanceParams): Promise<string>
  abstract txs (params: TxsParams): Promise<TxsResult>
  abstract txsByAccount (params: TxsByAccountParams): Promise<TxsResult>
  abstract txByHash (everHash: string): Promise<EverpayTransaction>
  abstract mintedTxByChainTxHash (chainTxHash: string): Promise<EverpayTransaction>
  abstract getEverpayTxMessage (everpayTxWithoutSig: EverpayTxWithoutSig): string
  abstract sendEverpayTx (everpayTxWithoutSig: EverpayTxWithoutSig): Promise<SendEverpayTxResult>
  abstract deposit (params: DepositParams): Promise<EthereumTransaction | ArweaveTransaction>
  abstract withdraw (params: WithdrawParams): Promise<SendEverpayTxResult>
  abstract transfer (params: TransferParams): Promise<SendEverpayTxResult>
}
