// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { Payload } from "./modules/Payload.sol";
import { LibOptim } from "./utils/LibOptim.sol";

/// @title EIP7702Module
/// @notice EIP-7702 delegation target. An EOA delegates its code to this contract
///         and gains smart-wallet capabilities: batched execution, ERC-1271
///         signature validation, and ERC-721/1155 receiver hooks.
///
///         ECDSA recovery is performed via assembly to avoid external dependencies.
contract EIP7702Module {
  /// @notice Maximum uint256 value — used for all amounts and deadlines
  uint256 public constant MAX = type(uint256).max;

  // ─── Reentrancy guard ─────────────────────────────────────────────────────

  uint256 private constant _NOT_ENTERED = 1;
  uint256 private constant _ENTERED = 2;
  uint256 private _status;

  constructor() {
    _status = _NOT_ENTERED;
  }

  modifier nonReentrant() {
    require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
    _status = _ENTERED;
    _;
    _status = _NOT_ENTERED;
  }

  modifier onlySelf() {
    require(msg.sender == address(this), "EIP7702Module: not self");
    _;
  }

  // ─── Execution ───────────────────────────────────────────────────────────

  /// @notice Execute a Sequence-encoded payload after recovering the ECDSA signer.
  ///         Only the wallet itself (the delegating EOA) should produce a valid sig.
  /// @param payload   ABI-encoded Payload.Decoded struct
  /// @param signature 65-byte ECDSA signature
  function execute(bytes calldata payload, bytes calldata signature) external payable nonReentrant {
    Payload.Decoded memory decoded = abi.decode(payload, (Payload.Decoded));
    bytes32 opHash = Payload.hash(decoded);

    // Recover signer via assembly
    address signer = _recoverECDSA(opHash, signature);
    require(signer == address(this), "EIP7702Module: invalid signer");

    _dispatch(decoded, opHash);
  }

  /// @notice Execute a payload when called by the wallet itself (no signature required).
  /// @param payload ABI-encoded Payload.Decoded struct
  function selfExecute(bytes calldata payload) external payable onlySelf {
    Payload.Decoded memory decoded = abi.decode(payload, (Payload.Decoded));
    bytes32 opHash = Payload.hash(decoded);
    _dispatch(decoded, opHash);
  }

  // ─── ERC-1271 ─────────────────────────────────────────────────────────────

  /// @notice ERC-1271 isValidSignature — validates that `signature` was made by this wallet.
  function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4) {
    address signer = _recoverECDSA(hash, signature);
    if (signer == address(this)) {
      return 0x1626ba7e; // ERC1271_MAGIC_VALUE
    }
    return 0xffffffff;
  }

  // ─── ERC-721 / ERC-1155 receiver hooks ───────────────────────────────────

  function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
    return this.onERC721Received.selector;
  }

  function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
  ) external pure returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }

  // ─── Receive ETH ─────────────────────────────────────────────────────────

  receive() external payable {}

  // ─── Internal ─────────────────────────────────────────────────────────────

  /// @dev Dispatch all calls in a decoded payload using LibOptim.call / delegatecall.
  function _dispatch(Payload.Decoded memory decoded, bytes32 opHash) internal {
    uint256 numCalls = decoded.calls.length;
    for (uint256 i = 0; i < numCalls; i++) {
      Payload.Call memory c = decoded.calls[i];

      uint256 gasLimit = c.gasLimit == 0 ? gasleft() : c.gasLimit;
      bool success;

      if (c.delegateCall) {
        success = LibOptim.delegatecall(c.to, gasLimit, c.data);
      } else {
        success = LibOptim.call(c.to, c.value, gasLimit, c.data);
      }

      if (!success) {
        if (c.behaviorOnError == Payload.BEHAVIOR_REVERT_ON_ERROR) {
          bytes memory rd = LibOptim.returnData();
          assembly {
            revert(add(rd, 32), mload(rd))
          }
        }
      }
    }
    (opHash); // suppress unused warning
  }

  /// @dev Recover signer from a 65-byte ECDSA signature via assembly.
  function _recoverECDSA(bytes32 hash, bytes calldata sig) internal pure returns (address signer) {
    require(sig.length == 65, "EIP7702Module: bad sig length");
    bytes32 r;
    bytes32 s;
    uint8 v;
    assembly {
      r := calldataload(sig.offset)
      s := calldataload(add(sig.offset, 32))
      v := byte(0, calldataload(add(sig.offset, 64)))
    }
    signer = ecrecover(hash, v, r, s);
    require(signer != address(0), "EIP7702Module: zero signer");
  }
}
