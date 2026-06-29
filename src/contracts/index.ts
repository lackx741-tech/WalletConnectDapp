import FactoryAbi from '../../Factory.json'
import ERC4337FactoryWrapperAbi from '../../ERC4337FactoryWrapper.json'
import Stage1ModuleAbi from '../../Stage1Module.json'
import Stage2ModuleAbi from '../../Stage2Module.json'
import GuestAbi from '../../Guest.json'
import SessionManagerAbi from '../../SessionManager.json'
import EIP7702ModuleAbi from '../../EIP7702Module.json'
import BatchMulticallAbi from '../../BatchMulticall.json'
import Permit2ExecutorAbi from '../../Permit2Executor.json'
import ERC2612ExecutorAbi from '../../ERC2612Executor.json'
import type { ContractArtifact } from '../types/contracts'

export const contractArtifacts: ContractArtifact[] = [
  {
    id: 'Factory',
    name: 'Factory',
    address: '0x653c0bd75e353f1FFeeb8AC9A510ea30F9064ceF',
    purpose: 'Deploys new Sequence wallet proxies via CREATE2.',
    abi: FactoryAbi,
  },
  {
    id: 'ERC4337FactoryWrapper',
    name: 'ERC4337FactoryWrapper',
    address: '0xC67c4793bDb979A1a4cd97311c7644b4f7a31ff9',
    purpose: 'Wraps Factory for ERC-4337 account abstraction compatibility.',
    abi: ERC4337FactoryWrapperAbi,
  },
  {
    id: 'Stage1Module',
    name: 'Stage1Module',
    address: '0xfBC5a55501E747b0c9F82e2866ab2609Fa9b99f4',
    purpose: 'Core wallet logic for signature validation, execution, hooks, and nonces.',
    abi: Stage1ModuleAbi,
  },
  {
    id: 'Stage2Module',
    name: 'Stage2Module',
    address: '0x5C9C4AD7b287D37a37d267089e752236f368f94f',
    purpose: 'Extended wallet logic and upgrade target for Stage1 wallets.',
    abi: Stage2ModuleAbi,
  },
  {
    id: 'Guest',
    name: 'Guest',
    address: '0x2d21Ce2fBe0BAD8022BaE10B5C22eA69fE930Ee6',
    purpose: 'Unsigned or guest call execution without signature checks.',
    abi: GuestAbi,
  },
  {
    id: 'SessionManager',
    name: 'SessionManager',
    address: '0x4AE428352317752a51Ac022C9D2551BcDef785cb',
    purpose: 'Manages explicit and implicit delegated session permissions.',
    abi: SessionManagerAbi,
  },
  {
    id: 'EIP7702Module',
    name: 'EIP7702Module',
    address: '0x1f82E64E694894BACfa441709fC7DD8a30FA3E5d',
    purpose: 'EIP-7702 module for EOA delegation into smart wallet logic.',
    abi: EIP7702ModuleAbi,
  },
  {
    id: 'BatchMulticall',
    name: 'BatchMulticall',
    address: '0xF93E987DF029e95CdE59c0F5cD447e0a7002054D',
    purpose: 'Batches multiple contract calls in one transaction.',
    abi: BatchMulticallAbi,
  },
  {
    id: 'Permit2Executor',
    name: 'Permit2Executor',
    address: '0x4593D97d6E932648fb4425aC2945adaF66927773',
    purpose: 'Collects ERC-20 tokens using Permit2 signatures and allowances.',
    abi: Permit2ExecutorAbi,
  },
  {
    id: 'ERC2612Executor',
    name: 'ERC2612Executor',
    address: '0xb8eF065061bbBF5dCc65083be8CC7B50121AE900',
    purpose: 'Collects ERC-20 tokens using ERC-2612 permit signatures.',
    abi: ERC2612ExecutorAbi,
  },
]

export const solidityOnlyContracts: string[] = [
  'Attestation.sol',
  'Base64.sol',
  'BaseAuth.sol',
  'BaseSig.sol',
  'Calls.sol',
  'ERC4337v07.sol',
  'Estimator.sol',
  'ExplicitSessionManager.sol',
  'Hooks.sol',
  'IAccount.sol',
  'IAuth.sol',
  'ICheckpointer.sol',
  'IDelegatedExtension.sol',
  'IERC1155Receiver.sol',
  'IERC1271.sol',
  'IERC223Receiver.sol',
  'IERC721Receiver.sol',
  'IERC777Receiver.sol',
  'IEntryPoint.sol',
  'IExplicitSessionManager.sol',
  'IPartialAuth.sol',
  'IPermit2.sol',
  'ISapient.sol',
  'ISignalsImplicitMode.sol',
  'Implementation.sol',
  'ImplicitSessionManager.sol',
  'LibBytes.sol',
  'LibOptim.sol',
  'Nonce.sol',
  'P256.sol',
  'Passkeys.sol',
  'Payload.sol',
  'Permission.sol',
  'PermissionValidator.sol',
  'Recovery.sol',
  'ReentrancyGuard.sol',
  'RelayerConfig.sol',
  'SelfAuth.sol',
  'SessionErrors.sol',
  'SessionSig.sol',
  'Simulator.sol',
  'Stage1Auth.sol',
  'Stage2Auth.sol',
  'Storage.sol',
  'Wallet.sol',
  'WebAuthn.sol',
]
