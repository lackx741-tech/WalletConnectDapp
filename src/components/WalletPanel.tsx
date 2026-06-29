import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { wcProjectId } from '../config/wagmi'

type WalletPanelProps = {
  compact?: boolean
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletPanel({ compact = false }: WalletPanelProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connectors, connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (!wcProjectId) {
    return (
      <div className="panel warning">
        Missing <code>VITE_WALLETCONNECT_PROJECT_ID</code>. Add it to your <code>.env</code> to enable wallet connection.
      </div>
    )
  }

  if (!isConnected) {
    const connector = connectors[0]

    return (
      <div className="panel">
        <button
          className="button"
          onClick={() => connector && connect({ connector })}
          disabled={!connector || isPending}
        >
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error ? <p className="error">{error.message}</p> : null}
      </div>
    )
  }

  return (
    <div className="panel">
      <div className={compact ? 'walletMeta compact' : 'walletMeta'}>
        <span>
          <strong>Address:</strong> {address ? shortAddress(address) : '-'}
        </span>
        <span>
          <strong>Chain ID:</strong> {chainId}
        </span>
      </div>
      <button className="button secondary" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  )
}
