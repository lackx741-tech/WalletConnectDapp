# WalletConnect Dapp

A minimal, production-ready decentralized application template built with **WalletConnect Web3Modal v4**, **wagmi v2**, **viem**, and **React + Vite**.

## Features

- 🔗 **300+ wallet support** via WalletConnect protocol
- ⛓️ **Multi-chain** — Ethereum Mainnet & Sepolia pre-configured
- 💼 **Account info** — address, ENS name, balance, chain ID
- 🌙 **Dark UI** — clean, responsive dark-mode design
- ⚡ **Vite** — lightning-fast dev server and builds
- 🔷 **TypeScript** — fully typed

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A WalletConnect **Project ID** from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and add your WalletConnect Project ID:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_WC_PROJECT_ID=your_project_id_here
```

> **Note:** The app will work in demo mode without a Project ID, but wallet connections will be limited. Get a free Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── AccountInfo.tsx   # Displays connected wallet info
│   └── ConnectButton.tsx # Connect / disconnect wallet button
├── config/
│   └── index.ts          # wagmi & Web3Modal configuration
├── App.tsx               # Root component with providers
├── main.tsx              # React entry point
└── index.css             # Global styles
```

## Adding More Chains

Edit `src/config/index.ts` and add chains from `wagmi/chains`:

```ts
import { mainnet, sepolia, polygon, optimism } from 'wagmi/chains'

export const chains = [mainnet, sepolia, polygon, optimism] as const
```

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| [wagmi](https://wagmi.sh) | v2 | React hooks for Ethereum |
| [viem](https://viem.sh) | v2 | TypeScript Ethereum library |
| [@web3modal/wagmi](https://docs.walletconnect.com/web3modal/react/about) | v4 | WalletConnect modal |
| [@tanstack/react-query](https://tanstack.com/query) | v5 | Async state management |
| [React](https://react.dev) | v18 | UI framework |
| [Vite](https://vite.dev) | v5 | Build tool |

## License

MIT
