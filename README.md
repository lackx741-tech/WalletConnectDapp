# WalletConnectDapp Dashboard

React + Vite + wagmi dashboard for WalletConnect, built around the uploaded 0xSession contract artifacts in this repository.

## What this app does

- Connects wallets through WalletConnect (wagmi connector).
- Shows all available root-level JSON contract artifacts in a frontend registry.
- Separates contracts with JSON artifacts from Solidity-only source files.
- Lets you select contract modules and generate an embeddable `script.js` connect-button bootstrap.
- Shows a live “selected contracts preview JSON” block so you can inspect the exact embedded metadata before download.
- Provides copy/download for the generated `script.js`.

## Included artifact registry

The dashboard currently wires these JSON artifacts:

- `Factory.json`
- `ERC4337FactoryWrapper.json`
- `Stage1Module.json`
- `Stage2Module.json`
- `Guest.json`
- `SessionManager.json`
- `EIP7702Module.json`
- `BatchMulticall.json`
- `Permit2Executor.json`
- `ERC2612Executor.json`

Solidity-only contracts are shown in a separate list in the UI (no ABI fabricated).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required env vars:

- `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project ID

Optional env vars:

- `VITE_DAPP_URL` — URL where this dashboard is hosted (used by script generator, and should match your hosted dApp origin)

## Build and lint

```bash
npm run lint
npm run build
```

## How script generation works

In the dashboard:

1. Select contract artifacts to include in embed context.
2. Set the dashboard URL and button label.
3. Inspect the live selected-contract metadata JSON preview.
4. Copy or download generated `script.js`.

If you clear every contract selection, the generated script exports an empty contract metadata array on purpose. If the embed popup is opened without a `contracts` query parameter, it falls back to the dashboard's full default artifact list.

The generated script injects a connect button into the host page and opens this dashboard in `?embed=1` mode. Once connected, the popup sends wallet connection status back to the parent page via `postMessage`.

### Example generated embed usage

```html
<div id="walletconnect-button-slot"></div>
<script src="/script.js"></script>
<script>
  window.addEventListener('walletconnect:status', (event) => {
    console.log('wallet status update', event.detail)
  })
</script>
```
