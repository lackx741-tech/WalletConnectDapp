import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Get your projectId from https://cloud.walletconnect.com
export const projectId = import.meta.env.VITE_WC_PROJECT_ID as string

if (!projectId) {
  console.warn(
    'WalletConnect Project ID is not set. Please set VITE_WC_PROJECT_ID in your .env file.',
  )
}

const metadata = {
  name: 'WalletConnect Dapp',
  description: 'A WalletConnect-powered decentralized application template',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

export const config = defaultWagmiConfig({
  chains: [mainnet, sepolia],
  projectId: projectId || 'demo-project-id',
  metadata,
  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
