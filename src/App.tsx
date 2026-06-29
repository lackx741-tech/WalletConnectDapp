import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config, projectId } from './config'
import { AccountInfo } from './components/AccountInfo'
import { ConnectButton } from './components/ConnectButton'

const queryClient = new QueryClient()

createWeb3Modal({
  wagmiConfig: config,
  projectId: projectId || 'demo-project-id',
  enableAnalytics: false,
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <header className="header">
            <div className="header-content">
              <div className="logo">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 96 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M25.7 34.4c12.3-12 32.2-12 44.5 0l1.5 1.4c.6.6.6 1.6 0 2.2l-5.1 5c-.3.3-.8.3-1.1 0l-2-2c-8.6-8.4-22.5-8.4-31.1 0l-2.2 2.1c-.3.3-.8.3-1.1 0l-5.1-5c-.6-.6-.6-1.6 0-2.2l1.7-1.5zm55 10.2 4.5 4.4c.6.6.6 1.6 0 2.2l-20.3 19.8c-.6.6-1.6.6-2.2 0L48.8 57.2c-.2-.1-.4-.1-.6 0L34.3 71c-.6.6-1.6.6-2.2 0L11.8 51.2c-.6-.6-.6-1.6 0-2.2l4.5-4.4c.6-.6 1.6-.6 2.2 0l13.9 13.6c.2.1.4.1.6 0l13.9-13.6c.6-.6 1.6-.6 2.2 0l13.9 13.6c.2.1.4.1.6 0l13.9-13.6c.6-.6 1.6-.6 2.2 0z"
                    fill="#3B99FC"
                  />
                </svg>
                <span>WalletConnect Dapp</span>
              </div>
              <ConnectButton />
            </div>
          </header>

          <main className="main">
            <section className="hero">
              <h1>Welcome to WalletConnect Dapp</h1>
              <p className="hero-subtitle">
                A template for building decentralized applications with WalletConnect
              </p>
            </section>

            <section className="content">
              <AccountInfo />

              <div className="info-cards">
                <div className="info-card">
                  <h3>🔗 Connect Any Wallet</h3>
                  <p>
                    Supports 300+ wallets via WalletConnect protocol, including
                    MetaMask, Rainbow, Trust Wallet, and more.
                  </p>
                </div>
                <div className="info-card">
                  <h3>⛓️ Multi-Chain</h3>
                  <p>
                    Pre-configured for Ethereum Mainnet and Sepolia testnet.
                    Easily add more chains to suit your needs.
                  </p>
                </div>
                <div className="info-card">
                  <h3>🛠️ Ready to Build</h3>
                  <p>
                    Built with wagmi v2, viem, and React. Extend this template
                    to build your own on-chain application.
                  </p>
                </div>
              </div>
            </section>
          </main>

          <footer className="footer">
            <p>
              Built with{' '}
              <a
                href="https://docs.walletconnect.com/web3modal/react/about"
                target="_blank"
                rel="noopener noreferrer"
              >
                Web3Modal
              </a>{' '}
              &amp;{' '}
              <a
                href="https://wagmi.sh"
                target="_blank"
                rel="noopener noreferrer"
              >
                wagmi
              </a>
            </p>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
