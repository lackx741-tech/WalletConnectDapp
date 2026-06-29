import { useMemo, useState } from 'react'
import { ContractCard } from './ContractCard'
import { ScriptGenerator } from './ScriptGenerator'
import { WalletPanel } from './WalletPanel'
import { contractArtifacts, solidityOnlyContracts } from '../contracts'

export function Dashboard() {
  const [selectedIds, setSelectedIds] = useState<string[]>(contractArtifacts.map((contract) => contract.id))

  function toggleSelection(contractId: string) {
    setSelectedIds((current) =>
      current.includes(contractId)
        ? current.filter((id) => id !== contractId)
        : [...current, contractId],
    )
  }

  const selectedContracts = useMemo(
    () => contractArtifacts.filter((contract) => selectedIds.includes(contract.id)),
    [selectedIds],
  )

  return (
    <main className="layout">
      <header className="hero card">
        <h1>WalletConnect Dashboard + Embed Script Builder</h1>
        <p>
          Browse 0xSession contract artifacts, connect your wallet via WalletConnect, and generate an embeddable <code>script.js</code> connect-button bootstrap for external sites.
        </p>
        <WalletPanel />
      </header>

      <section className="card">
        <h2>Available JSON artifacts ({contractArtifacts.length})</h2>
        <p>These contracts include JSON ABI artifacts and are ready for frontend integration.</p>
        <div className="contractGrid">
          {contractArtifacts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              selected={selectedIds.includes(contract.id)}
              onToggle={toggleSelection}
            />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Solidity source only ({solidityOnlyContracts.length})</h2>
        <p>These files exist as Solidity source in this repository but do not currently have matching JSON artifacts.</p>
        <ul className="solidityOnlyList">
          {solidityOnlyContracts.map((sourceFile) => (
            <li key={sourceFile}>{sourceFile}</li>
          ))}
        </ul>
      </section>

      <ScriptGenerator selectedContracts={selectedContracts} />
    </main>
  )
}
