import { useMemo, useState } from 'react'
import type { ContractArtifact } from '../types/contracts'
import { buildEmbedScript } from '../utils/scriptGenerator'

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
      <h2>Embeddable script.js generator</h2>
      <p>
        Generate a production-ready starter script that injects a connect button and opens this dashboard in embed mode for WalletConnect sessions.
      </p>

      <div className="controls">
        <label>
          Dapp URL hosting this dashboard
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
