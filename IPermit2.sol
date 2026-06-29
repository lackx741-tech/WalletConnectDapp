// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @title IPermit2
/// @notice Full interface for the canonical Permit2 singleton
///         (deployed at 0x000000000022D473030F116dDEE9F6B43aC78BA3 on all chains).
interface IPermit2 {
  // ─── Structs ─────────────────────────────────────────────────────────────────

  /// @notice Token and amount for a permit
  struct TokenPermissions {
    address token;
    uint256 amount;
  }

  /// @notice Details for a single token allowance
  struct PermitDetails {
    address token;
    uint160 amount;
    uint48 expiration;
    uint48 nonce;
  }

  /// @notice Permit data for a single token
  struct PermitSingle {
    PermitDetails details;
    address spender;
    uint256 sigDeadline;
  }

  /// @notice Permit data for multiple tokens
  struct PermitBatch {
    PermitDetails[] details;
    address spender;
    uint256 sigDeadline;
  }

  /// @notice Destination and amount for a signature-based transfer
  struct SignatureTransferDetails {
    address to;
    uint256 requestedAmount;
  }

  /// @notice Permit data for a one-shot signature transfer (single token)
  struct PermitTransferFrom {
    TokenPermissions permitted;
    uint256 nonce;
    uint256 deadline;
  }

  /// @notice Permit data for a one-shot signature batch transfer
  struct PermitBatchTransferFrom {
    TokenPermissions[] permitted;
    uint256 nonce;
    uint256 deadline;
  }

  // ─── Allowance-based permit ───────────────────────────────────────────────

  /// @notice Approve a spender for a single token allowance via permit
  function permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature) external;

  /// @notice Approve a spender for multiple token allowances via permit
  function permit(address owner, PermitBatch calldata permitBatch, bytes calldata signature) external;

  /// @notice Transfer tokens using an existing allowance (single)
  function transferFrom(address from, address to, uint160 amount, address token) external;

  /// @notice Transfer tokens using existing allowances (batch)
  function transferFrom(
    address from,
    address[] calldata to,
    uint160[] calldata amounts,
    address[] calldata tokens
  ) external;

  // ─── Signature-based one-shot transfer ───────────────────────────────────

  /// @notice Transfer a single token via a one-shot permit signature
  function permitTransferFrom(
    PermitTransferFrom calldata permit,
    SignatureTransferDetails calldata transferDetails,
    address owner,
    bytes calldata signature
  ) external;

  /// @notice Transfer multiple tokens via a one-shot permit signature
  function permitTransferFrom(
    PermitBatchTransferFrom calldata permit,
    SignatureTransferDetails[] calldata transferDetails,
    address owner,
    bytes calldata signature
  ) external;

  // ─── View ─────────────────────────────────────────────────────────────────

  /// @notice Returns the current allowance for (owner, token, spender)
  /// @return amount     Approved amount (uint160 at the ABI boundary)
  /// @return expiration Expiration timestamp (uint48 at the ABI boundary)
  /// @return nonce      Current nonce (uint48 at the ABI boundary)
  function allowance(
    address owner,
    address token,
    address spender
  ) external view returns (uint160 amount, uint48 expiration, uint48 nonce);

  /// @notice Returns the EIP-712 domain separator for this Permit2 deployment
  function DOMAIN_SEPARATOR() external view returns (bytes32);
}
