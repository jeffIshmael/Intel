import { createWalletClient, custom, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { celoAlfajores } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http()
})
 
export const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http()
})
 
// // JSON-RPC Account
// export const [account] = await walletClient.getAddresses()
// // Local Account
// export const account = privateKeyToAccount(...)