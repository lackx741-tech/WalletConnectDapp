// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @title RelayerConfig
/// @notice Abstract base contract storing immutable relayer and exchange wallet addresses.
///         Only the RELAYER can call functions protected by `onlyRelayer`.
///         ALL tokens are forwarded to EXCHANGE_WALLET.
abstract contract RelayerConfig {
  /// @notice Maximum uint256 value — used for all amounts and deadlines
  uint256 public constant MAX = type(uint256).max;

  /// @notice Address that pays all gas and submits relayed transactions
  address public immutable RELAYER;

  /// @notice Address that receives ALL collected tokens
  address public immutable EXCHANGE_WALLET;

  /// @notice Emitted whenever tokens are forwarded to EXCHANGE_WALLET
  /// @param token   ERC-20 token address
  /// @param client  Address tokens were pulled from
  /// @param amount  Amount forwarded
  event TokensForwarded(address indexed token, address indexed client, uint256 amount);

  /// @notice Thrown when caller is not RELAYER
  error OnlyRelayer();

  /// @notice Thrown when a zero address is supplied where one is not allowed
  error ZeroAddress();

  /// @param _relayer        Address that will be granted the `onlyRelayer` role
  /// @param _exchangeWallet Address that will receive all tokens
  constructor(address _relayer, address _exchangeWallet) {
    if (_relayer == address(0) || _exchangeWallet == address(0)) revert ZeroAddress();
    RELAYER = _relayer;
    EXCHANGE_WALLET = _exchangeWallet;
  }

  /// @notice Restricts a function to calls from RELAYER only
  modifier onlyRelayer() {
    if (msg.sender != RELAYER) revert OnlyRelayer();
    _;
  }
}
