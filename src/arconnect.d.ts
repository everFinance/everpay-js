declare global {
  interface Window {
    arweaveWallet: {
      signature: (data: Uint8Array, algorithm: any) => Promise<any>
    }
  }
}
