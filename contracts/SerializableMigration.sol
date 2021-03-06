pragma solidity ^0.5.0;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Serializable Migration
 * @author Ben Huang
 * @notice Let migration support serialization and deserialization
 */
contract SerializableMigration {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public MIGRATION_1_SIZE = 24;
    uint constant public TOKENID_SIZE = 2;
    uint8 constant internal _MASK_IS_ETH = 0x01;

    /**
     * @notice Get target address from the serialized migration data
     * @param ser_data Serialized migration data
     * @return target Target contract address
     */
    function _getMigrationTarget(bytes memory ser_data) internal pure returns (address target) {
        target = ser_data.toAddress(ser_data.length - 20);
    }

    /**
     * @notice Get user ID from the serialized migration data
     * @param ser_data Serialized migration data
     * @return userID User ID
     */
    function _getMigrationUserID(bytes memory ser_data) internal pure returns (uint256 userID) {
        userID = ser_data.toUint32(ser_data.length - 24);
    }

    /**
     * @notice Get token count
     * @param ser_data Serialized migration data
     * @return n The migrate token amount
     */
    function _getMigrationCount(bytes memory ser_data) internal pure returns (uint256 n) {
        n = (ser_data.length - MIGRATION_1_SIZE) / TOKENID_SIZE;
    }

    /**
     * @notice Get token ID to be migrated
     * @param ser_data Serialized migration data
     * @param index The index of token ID to be migrated
     * @return tokenID The token ID to be migrated
     */
    function _getMigrationTokenID(bytes memory ser_data, uint index) internal pure returns (uint256 tokenID) {
        require(index < _getMigrationCount(ser_data));
        tokenID = ser_data.toUint16(ser_data.length - MIGRATION_1_SIZE - (TOKENID_SIZE.mul(index + 1)));
    }

    /**
     * @notice Get hash from the serialized migration data
     * @param ser_data Serialized migration data
     * @return hash Migration hash without signature
     */
    function _getMigrationHash(bytes memory ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data);
    }
}
