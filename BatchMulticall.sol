// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/// @title BatchMulticall
/// @notice Permissionless, auth-free batch executor.
///         Callers may bundle arbitrary calls into a single transaction.
///         `value=MAX` (type(uint256).max) on any individual call forwards
///         all remaining ETH to that call.
///         Unused ETH is refunded to the caller after execution.
contract BatchMulticall {
  /// @notice Maximum uint256 value — sentinel to forward ALL remaining ETH
  uint256 public constant MAX = type(uint256).max;

  /// @notice A single call in a batch
  struct Call {
    address target;
    uint256 value;
    bytes data;
    bool allowFailure;
  }

  /// @notice Emitted once per successful batch execution
  /// @param caller        Address that submitted the batch
  /// @param callsExecuted Number of calls that were executed
  event BatchExecuted(address indexed caller, uint256 callsExecuted);

  /// @notice Execute a batch of calls, forwarding ETH as specified.
  ///         `call.value == MAX` → forward all remaining ETH to that call.
  ///         Unused ETH is refunded to msg.sender after all calls complete.
  /// @param calls Array of calls to execute
  function batch(Call[] calldata calls) external payable {
    uint256 len = calls.length;
    uint256 remaining = msg.value;

    for (uint256 i = 0; i < len; i++) {
      uint256 callValue = calls[i].value == MAX ? remaining : calls[i].value;
      require(callValue <= remaining, "BatchMulticall: insufficient ETH");

      (bool success, bytes memory returnData) = calls[i].target.call{ value: callValue }(calls[i].data);
      remaining -= callValue;

      if (!success && !calls[i].allowFailure) {
        assembly {
          revert(add(returnData, 32), mload(returnData))
        }
      }
    }

    // Refund unused ETH
    if (remaining > 0) {
      (bool refunded,) = msg.sender.call{ value: remaining }("");
      require(refunded, "BatchMulticall: ETH refund failed");
    }

    emit BatchExecuted(msg.sender, len);
  }

  /// @notice Perform a batch of static (view) calls.
  ///         Reverts if any call reverts.
  /// @param targets Array of target addresses
  /// @param data    Corresponding calldata
  /// @return results ABI-encoded return data for each call
  function batchStatic(
    address[] calldata targets,
    bytes[] calldata data
  ) external view returns (bytes[] memory results) {
    uint256 len = targets.length;
    require(len == data.length, "BatchMulticall: length mismatch");
    results = new bytes[](len);
    for (uint256 i = 0; i < len; i++) {
      (bool success, bytes memory returnData) = targets[i].staticcall(data[i]);
      require(success, "BatchMulticall: static call failed");
      results[i] = returnData;
    }
  }
}
