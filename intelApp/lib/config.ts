import { createWalletClient, http, createPublicClient } from 'viem'
// import { privateKeyToAccount } from 'viem/accounts'
import { celo } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: celo,
  transport: http()
})
 
export const walletClient = createWalletClient({
  chain: celo,
  transport: http()
})
 
// // JSON-RPC Account
// export const [account] = await walletClient.getAddresses()
// // Local Account
// export const account = privateKeyToAccount(...)