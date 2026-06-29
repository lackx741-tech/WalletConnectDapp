import type { ContractArtifact } from '../types/contracts'

type ContractCardProps = {
  contract: ContractArtifact
  selected: boolean
  onToggle: (contractId: string) => void
}

export function ContractCard({ contract, selected, onToggle }: ContractCardProps) {
  const functionCount = contract.abi.filter((entry) => entry.type === 'function').length

  return (
    <article className="card contractCard">
      <label className="checkboxRow">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(contract.id)}
        />
        <strong>{contract.name}</strong>
      </label>
      <p>{contract.purpose}</p>
      <dl>
        <div>
          <dt>Address</dt>
          <dd>{contract.address}</dd>
        </div>
        <div>
          <dt>ABI Entries</dt>
          <dd>{contract.abi.length}</dd>
        </div>
        <div>
          <dt>Functions</dt>
          <dd>{functionCount}</dd>
        </div>
      </dl>
    </article>
  )
}
