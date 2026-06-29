import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { WalletPanel } from './WalletPanel'
import { contractArtifacts } from '../contracts'

function parseSelectedContracts() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('contracts')) return contractArtifacts

  const selected = params.get('contracts') ?? ''
  if (!selected.trim()) return []

  const ids = selected.split(',').map((item) => item.trim())
  return contractArtifacts.filter((contract) => ids.includes(contract.id))
}

export function EmbedView() {
  const { isConnected, address, chainId } = useAccount()
  const selectedContracts = parseSelectedContracts()
  const parentOrigin = useMemo(() => {
    try {
      if (document.referrer) {
        return new URL(document.referrer).origin
      }

      if (import.meta.env.VITE_DAPP_URL) {
        return new URL(import.meta.env.VITE_DAPP_URL).origin
      }
    } catch {
      // fall through to local origin
    }

    return window.location.origin
  }, [])

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
      parentOrigin,
    )
  }, [address, chainId, isConnected, parentOrigin])

  return (
    <main className="embedLayout">
      <h1>WalletConnect Embed</h1>
      <p>Connect your wallet to continue in the parent website.</p>
      <WalletPanel compact />
      <p className="small">Contracts in context: {selectedContracts.map((contract) => contract.name).join(', ')}</p>
    </main>
  )
}
