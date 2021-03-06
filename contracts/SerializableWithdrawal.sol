pragma solidity ^0.5.0;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Serializable Withdrawal
 * @author Ben Huang
 * @notice Let withdrawal support serialization and deserialization
 */
contract SerializableWithdrawal {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public WITHDRAWAL_SIZE = 75;
    uint8 constant internal _MASK_IS_MAIN = 0x01;

    /**
     * @notice Get user ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return userID User ID
     */
    function _getWithdrawalUserID(bytes memory ser_data) internal pure returns (uint256 userID) {
        userID = ser_data.toUint32(WITHDRAWAL_SIZE - 4);
    }

    /**
     * @notice Get token ID from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return tokenID Withdrawal token ID
     */
    function _getWithdrawalTokenID(bytes memory ser_data) internal pure returns (uint256 tokenID) {
        tokenID = ser_data.toUint16(WITHDRAWAL_SIZE - 6);
    }

    /**
     * @notice Get amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return amount Withdrawal token amount
     */
    function _getWithdrawalAmount(bytes memory ser_data) internal pure returns (uint256 amount) {
        amount = ser_data.toUint(WITHDRAWAL_SIZE - 38);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized withdrawal data
     * @return fFeeMain Is the fee paid in withdraw token or DGO
     */
    function _isWithdrawalFeeMain(bytes memory ser_data) internal pure returns (bool fFeeMain) {
        fFeeMain = (ser_data.toUint8(WITHDRAWAL_SIZE - 39) & _MASK_IS_MAIN != 0);
    }

    /**
     * @notice Get nonce from the serialized withrawal data
     * @param ser_data Serialized withdrawal data
     * @return nonce Nonce
     */
    function _getWithdrawalNonce(bytes memory ser_data) internal pure returns (uint256 nonce) {
        nonce = ser_data.toUint32(WITHDRAWAL_SIZE - 43);
    }

    /**
     * @notice Get fee amount from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return fee Fee amount
     */
    function _getWithdrawalFee(bytes memory ser_data) internal pure returns (uint256 fee) {
        fee = ser_data.toUint(WITHDRAWAL_SIZE - 75);
    }

    /**
     * @notice Get hash from the serialized withdrawal data
     * @param ser_data Serialized withdrawal data
     * @return hash Withdrawal hash without signature
     */
    function _getWithdrawalHash(bytes memory ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data);
    }
}
