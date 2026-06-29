export type AbiEntry = {
  type?: string
  name?: string
  stateMutability?: string
  inputs?: Array<{ name?: string; type?: string }>
  outputs?: Array<{ name?: string; type?: string }>
}

export type ContractArtifact = {
  id: string
  name: string
  address: `0x${string}`
  purpose: string
  abi: AbiEntry[]
}
