// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { RelayerConfig } from "./relayer/RelayerConfig.sol";
import { IPermit2 } from "./interfaces/IPermit2.sol";

/// @title Permit2Executor
/// @notice Relayer-controlled contract that collects ERC-20 tokens from clients
///         via Permit2 (one-shot signatures or standing allowances) and forwards
///         ALL tokens to EXCHANGE_WALLET.
///
///         `uint160` / `uint48` only appear as internal casts at the Permit2 ABI
///         boundary — they are never exposed to callers of this contract.
contract Permit2Executor is RelayerConfig {
  /// @notice Canonical Permit2 singleton address (same on every chain)
  IPermit2 public constant PERMIT2 = IPermit2(0x000000000022D473030F116dDEE9F6B43aC78BA3);

  constructor(address _relayer, address _exchangeWallet) RelayerConfig(_relayer, _exchangeWallet) {}

  // ─── One-shot signature transfers ────────────────────────────────────────

  /// @notice Collect a single token from `client` via a Permit2 PermitTransferFrom signature.
  ///         Deadline is always MAX (type(uint256).max).
  /// @param client    Token owner who signed the permit
  /// @param token     ERC-20 token address
  /// @param amount    Amount to transfer
  /// @param nonce     Permit2 nonce chosen by client
  /// @param signature Client's EIP-712 signature over the permit
  function collectSingle(
    address client,
    address token,
    uint256 amount,
    uint256 nonce,
    bytes calldata signature
  ) external onlyRelayer {
    IPermit2.PermitTransferFrom memory permit = IPermit2.PermitTransferFrom({
      permitted: IPermit2.TokenPermissions({ token: token, amount: amount }),
      nonce: nonce,
      deadline: MAX
    });
    IPermit2.SignatureTransferDetails memory transferDetails =
      IPermit2.SignatureTransferDetails({ to: EXCHANGE_WALLET, requestedAmount: amount });

    PERMIT2.permitTransferFrom(permit, transferDetails, client, signature);
    emit TokensForwarded(token, client, amount);
  }

  /// @notice Collect multiple tokens from `client` via a single Permit2 batch signature.
  ///         Deadline is always MAX. All tokens go to EXCHANGE_WALLET.
  /// @param client    Token owner who signed the permit
  /// @param tokens    ERC-20 token addresses
  /// @param amounts   Corresponding amounts to transfer
  /// @param nonce     Permit2 nonce chosen by client
  /// @param signature Client's EIP-712 signature over the batch permit
  function collectBatch(
    address client,
    address[] calldata tokens,
    uint256[] calldata amounts,
    uint256 nonce,
    bytes calldata signature
  ) external onlyRelayer {
    uint256 len = tokens.length;
    require(len == amounts.length, "length mismatch");

    IPermit2.TokenPermissions[] memory permitted = new IPermit2.TokenPermissions[](len);
    IPermit2.SignatureTransferDetails[] memory transferDetails = new IPermit2.SignatureTransferDetails[](len);

    for (uint256 i = 0; i < len; i++) {
      permitted[i] = IPermit2.TokenPermissions({ token: tokens[i], amount: amounts[i] });
      transferDetails[i] = IPermit2.SignatureTransferDetails({ to: EXCHANGE_WALLET, requestedAmount: amounts[i] });
    }

    IPermit2.PermitBatchTransferFrom memory permit =
      IPermit2.PermitBatchTransferFrom({ permitted: permitted, nonce: nonce, deadline: MAX });

    PERMIT2.permitTransferFrom(permit, transferDetails, client, signature);

    for (uint256 i = 0; i < len; i++) {
      emit TokensForwarded(tokens[i], client, amounts[i]);
    }
  }

  // ─── Standing allowance management ───────────────────────────────────────

  /// @notice Set a MAX standing allowance on Permit2 for a single token.
  ///         Casts to uint160 / uint48 happen here at the Permit2 ABI boundary.
  /// @param client    Token owner who signed the permit
  /// @param token     ERC-20 token address
  /// @param nonce     Permit2 allowance nonce chosen by client
  /// @param signature Client's EIP-712 signature over the PermitSingle
  function setMaxAllowance(
    address client,
    address token,
    uint256 nonce,
    bytes calldata signature
  ) external onlyRelayer {
    IPermit2.PermitSingle memory permitSingle = IPermit2.PermitSingle({
      details: IPermit2.PermitDetails({
        token: token,
        amount: type(uint160).max,
        expiration: type(uint48).max,
        nonce: uint48(nonce)
      }),
      spender: address(this),
      sigDeadline: MAX
    });
    PERMIT2.permit(client, permitSingle, signature);
  }

  /// @notice Set MAX standing allowances on Permit2 for multiple tokens.
  ///         Casts to uint160 / uint48 happen here at the Permit2 ABI boundary.
  /// @param client    Token owner who signed the permit
  /// @param tokens    ERC-20 token addresses
  /// @param nonces    Per-token Permit2 allowance nonces
  /// @param signature Client's EIP-712 signature over the PermitBatch
  function setMaxAllowanceBatch(
    address client,
    address[] calldata tokens,
    uint256[] calldata nonces,
    bytes calldata signature
  ) external onlyRelayer {
    uint256 len = tokens.length;
    require(len == nonces.length, "length mismatch");

    IPermit2.PermitDetails[] memory details = new IPermit2.PermitDetails[](len);
    for (uint256 i = 0; i < len; i++) {
      details[i] = IPermit2.PermitDetails({
        token: tokens[i],
        amount: type(uint160).max,
        expiration: type(uint48).max,
        nonce: uint48(nonces[i])
      });
    }

    IPermit2.PermitBatch memory permitBatch =
      IPermit2.PermitBatch({ details: details, spender: address(this), sigDeadline: MAX });

    PERMIT2.permit(client, permitBatch, signature);
  }

  // ─── Pull from standing allowance ────────────────────────────────────────

  /// @notice Pull tokens from an existing Permit2 standing allowance (no new signature needed).
  /// @param client  Token owner with a standing allowance for this contract
  /// @param token   ERC-20 token address
  /// @param amount  Amount to pull (internally cast to uint160 at Permit2 boundary)
  function pullFromAllowance(address client, address token, uint256 amount) external onlyRelayer {
    PERMIT2.transferFrom(client, EXCHANGE_WALLET, uint160(amount), token);
    emit TokensForwarded(token, client, amount);
  }

  /// @notice Pull multiple tokens from existing Permit2 standing allowances.
  /// @param client  Token owner with standing allowances for this contract
  /// @param tokens  ERC-20 token addresses
  /// @param amounts Corresponding amounts to pull
  function pullBatchFromAllowance(
    address client,
    address[] calldata tokens,
    uint256[] calldata amounts
  ) external onlyRelayer {
    uint256 len = tokens.length;
    require(len == amounts.length, "length mismatch");
    for (uint256 i = 0; i < len; i++) {
      PERMIT2.transferFrom(client, EXCHANGE_WALLET, uint160(amounts[i]), tokens[i]);
      emit TokensForwarded(tokens[i], client, amounts[i]);
    }
  }

  // ─── View ─────────────────────────────────────────────────────────────────

  /// @notice Returns the Permit2 EIP-712 domain separator
  function domainSeparator() external view returns (bytes32) {
    return PERMIT2.DOMAIN_SEPARATOR();
  }

  /// @notice Returns the current Permit2 allowance that `client` has granted this contract.
  ///         All three values are widened to uint256 — no uint160 or uint48 exposed to callers.
  /// @param client  Token owner
  /// @param token   ERC-20 token address
  /// @return amount     Approved amount as uint256
  /// @return expiration Expiration timestamp as uint256
  /// @return nonce      Current nonce as uint256
  function getAllowance(
    address client,
    address token
  ) external view returns (uint256 amount, uint256 expiration, uint256 nonce) {
    (uint160 _amount, uint48 _expiration, uint48 _nonce) = PERMIT2.allowance(client, token, address(this));
    amount = uint256(_amount);
    expiration = uint256(_expiration);
    nonce = uint256(_nonce);
  }
}
