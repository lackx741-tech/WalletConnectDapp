import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="connect-button-group">
        <button
          className="btn btn-secondary"
          onClick={() => open({ view: 'Account' })}
        >
          My Account
        </button>
        <button
          className="btn btn-outline"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={() => open()}>
      Connect Wallet
    </button>
  )
}
