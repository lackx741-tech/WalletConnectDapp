import { useMemo, useState } from 'react'
import type { ContractArtifact } from '../types/contracts'
import { buildEmbedScript, getEmbeddedContractMetadata } from '../utils/scriptGenerator'

type ScriptGeneratorProps = {
  selectedContracts: ContractArtifact[]
}

export function ScriptGenerator({ selectedContracts }: ScriptGeneratorProps) {
  const [dappUrl, setDappUrl] = useState(import.meta.env.VITE_DAPP_URL || window.location.origin)
  const [buttonText, setButtonText] = useState('Connect Wallet')
  const [copied, setCopied] = useState(false)

  const scriptOutput = useMemo(
    () => buildEmbedScript({ dappUrl, buttonText, selectedContracts }),
    [buttonText, dappUrl, selectedContracts],
  )
  const selectedContractsPreviewJson = useMemo(
    () => JSON.stringify(getEmbeddedContractMetadata(selectedContracts), null, 2),
    [selectedContracts],
  )

  async function copyToClipboard() {
    await navigator.clipboard.writeText(scriptOutput)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  function downloadScript() {
    const blob = new Blob([scriptOutput], { type: 'text/javascript;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = 'script.js'
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <section className="card">
      <h2>embeddable script.js generator</h2>
      <p>
        Generate an embeddable script that adds a WalletConnect button and opens this dashboard in embed mode for wallet sessions.
      </p>
      <p className="small">Set dApp URL to the same origin where this dashboard is hosted so message validation works correctly.</p>

      <div className="controls">
        <label>
          dApp URL hosting this dashboard
          <input value={dappUrl} onChange={(event) => setDappUrl(event.target.value)} placeholder="https://your-dapp.example" />
        </label>
        <label>
          Button text
          <input value={buttonText} onChange={(event) => setButtonText(event.target.value)} placeholder="Connect Wallet" />
        </label>
      </div>

      <p>
        Selected contracts in script context: {selectedContracts.length > 0 ? selectedContracts.map((contract) => contract.name).join(', ') : 'none'}
      </p>
      <p className="small">
        Clearing every selection exports an empty contract context. Leaving the embed query unset uses the dashboard default artifact list.
      </p>

      <div className="jsonPreviewBlock">
        <label htmlFor="selected-contracts-json-preview">Selected contracts preview JSON (embedded metadata)</label>
        <textarea
          id="selected-contracts-json-preview"
          value={selectedContractsPreviewJson}
          readOnly
          rows={8}
          onFocus={(event) => event.currentTarget.select()}
        />
      </div>

      <textarea value={scriptOutput} readOnly rows={16} />

      <div className="row">
        <button className="button" onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy script'}
        </button>
        <button className="button secondary" onClick={downloadScript}>
          Download script.js
        </button>
      </div>
    </section>
  )
}
