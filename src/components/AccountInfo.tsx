import { useAccount, useBalance, useChainId, useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function AccountInfo() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })

  if (isConnecting) {
    return (
      <div className="account-card">
        <div className="account-status connecting">
          <span className="status-dot" />
          Connecting...
        </div>
      </div>
    )
  }

  if (isDisconnected || !isConnected || !address) {
    return (
      <div className="account-card">
        <div className="account-status disconnected">
          <span className="status-dot" />
          Not connected
        </div>
        <p className="account-hint">
          Connect your wallet to get started
        </p>
      </div>
    )
  }

  return (
    <div className="account-card connected">
      <div className="account-status connected">
        <span className="status-dot" />
        Connected
      </div>

      <div className="account-details">
        <div className="detail-row">
          <span className="detail-label">Address</span>
          <span className="detail-value address" title={address}>
            {ensName ?? shortenAddress(address)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Network</span>
          <span className="detail-value">
            Chain ID: {chainId}
          </span>
        </div>

        {balance && (
          <div className="detail-row">
            <span className="detail-label">Balance</span>
            <span className="detail-value">
              {Number(balance.formatted).toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}{' '}
              {balance.symbol}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
