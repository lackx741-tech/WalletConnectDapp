import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? ''

const chains = [mainnet, sepolia, polygon, arbitrum] as const

const transports = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
  [arbitrum.id]: http(),
}

export const wagmiConfig = createConfig({
  chains,
  connectors: wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
          metadata: {
            name: 'WalletConnect Dashboard',
            description: 'Contract-aware embed script generator for WalletConnect.',
            url: import.meta.env.VITE_DAPP_URL || window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png'],
          },
        }),
      ]
    : [],
  transports,
})
