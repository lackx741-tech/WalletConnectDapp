import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletPanel } from './WalletPanel'
import { contractArtifacts } from '../contracts'

function parseSelectedContracts() {
  const params = new URLSearchParams(window.location.search)
  const selected = params.get('contracts')
  if (!selected) return contractArtifacts

  const ids = selected.split(',').map((item) => item.trim())
  return contractArtifacts.filter((contract) => ids.includes(contract.id))
}

export function EmbedView() {
  const { isConnected, address, chainId } = useAccount()
  const selectedContracts = parseSelectedContracts()

  useEffect(() => {
    if (!isConnected || !window.opener) {
      return
    }

    window.opener.postMessage(
      {
        source: 'walletconnect-dashboard',
        type: 'connected',
        address,
        chainId,
      },
      '*',
    )
  }, [address, chainId, isConnected])

  return (
    <main className="embedLayout">
      <h1>WalletConnect Embed</h1>
      <p>Connect your wallet to continue in the parent website.</p>
      <WalletPanel compact />
      <p className="small">Contracts in context: {selectedContracts.map((contract) => contract.name).join(', ')}</p>
    </main>
  )
}
