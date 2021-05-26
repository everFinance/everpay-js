import { Signer } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { PostEverpayTxResult } from './api/interface'
import { ArTransferResult } from './lib/interface'

export enum ChainType {
  ethereum = 'ethereum',
  arweave = 'arweave'
}

export type ArJWK = JWKInterface | 'use_wallet'

export interface Config {
  debug?: boolean
  account?: string
  ethConnectedSigner?: Signer
  arJWK?: ArJWK
}

export interface Token {
  id: string
  symbol: string
  decimals: number
  totalSupply: string
  burnFee: string
  transferFee: string
  chainType: ChainType
}

export interface EverpayInfo {
  ethLocker: string
  arLocker: string
  owner: string
  ethChainID: string
  arChainID: string
  feeRecipient: string
  tokenList: Token[]
}

export enum EverpayAction {
  transfer = 'transfer',
  withdraw = 'burn',
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
  chainType: ChainType
  chainID: string
  data: string
  version: string
}

export interface EverpayTx extends EverpayTxWithoutSig {
  sig: string
}

enum EverpayActionWithDeposit {
  transfer = 'transfer',
  withdraw = 'burn',
  deposit = 'mint'
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
  timestamp: number
}

export interface TxsResult {
  accid: string
  currentPage: number
  totalPages: number
  txs: EverpayTransaction[]
}

export interface BalanceParams {
  chainType: ChainType
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
  chainType: ChainType
  symbol: string
  amount: string
}

export interface WithdrawParams {
  chainType: ChainType
  symbol: string
  amount: string
  to?: string
}

export interface TxsParams {
  page: number
}

export interface TxsByAccountParams {
  page: number
  account?: string
}

export interface TransferParams extends WithdrawParams {
  to: string
}

export interface TransferOrWithdrawResult extends PostEverpayTxResult {
  everpayTx: EverpayTx
}

export abstract class EverpayBase {
  abstract getAccountChainType (address: string): ChainType
  abstract info (): Promise<EverpayInfo>
  abstract balance (params?: BalanceParams): Promise<number>
  abstract txs (params: TxsParams): Promise<TxsResult>
  abstract txsByAccount (params: TxsByAccountParams): Promise<TxsResult>
  abstract deposit (params: DepositParams): Promise<TransactionResponse | ArTransferResult>
  abstract withdraw (params: WithdrawParams): Promise<PostEverpayTxResult>
  abstract transfer (params: TransferParams): Promise<PostEverpayTxResult>
}
