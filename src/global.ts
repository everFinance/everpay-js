import { Signer } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { PostEverpayTxResult } from './api/interface'

export enum ChainType {
  ethereum = 'ethereum'
}
export interface Config {
  debug?: boolean
  account: string
  connectedSigner: Signer
}

export interface Token {
  id: string
  tokenSymbol: string
  decimals: number
  totalSupply: number
  chainType: ChainType
}

export interface EverpayInfo {
  ethLocker: string
  owner: string
  txVersion: string
  ethChainID: number
  feeRecipient: string
  tokenList: Token[]
}

export enum EverpayAction {
  transfer = 'transfer',
  withdraw = 'burn'
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
  data: string
  version: string
}

export interface EverpayTx extends EverpayTxWithoutSig {
  sig: string
}

export interface BalanceParams {
  chainType?: ChainType
  tokenSymbol?: string
  account?: string
}

export interface DepositParams {
  chainType: ChainType
  tokenSymbol: string
  amount: number
}

export interface TransferWithdrawParams {
  chainType: ChainType
  tokenSymbol: string
  to: string
  amount: number
}

export abstract class EverpayBase {
  abstract info (): Promise<EverpayInfo>
  abstract balance (params?: BalanceParams): Promise<number>
  abstract deposit (params: DepositParams): Promise<TransactionResponse>
  abstract transfer (params: TransferWithdrawParams): Promise<PostEverpayTxResult>
  abstract withdraw (params: TransferWithdrawParams): Promise<PostEverpayTxResult>
}
