pragma solidity ^0.4.24;

import "bytes/BytesLib.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Seriality/src/Seriality.sol";

/**
 * @title Serializable Order
 * @author Ben Huang
 * @notice Let order support serialization and deserialization
 */
contract SerializableOrder is Seriality {
    using SafeMath for uint256;
    using BytesLib for bytes;

    uint constant public ORDER_SIZE = 206;
    uint constant public UNSIGNED_ORDER_SIZE = 141;
    uint8 constant internal _MASK_IS_BUY = 0x01;
    uint8 constant internal _MASK_IS_MAIN = 0x02;

    /**
     * @notice Get user ID from the serialized order data
     * @param ser_data Serialized order data
     * @return userID User ID
     */
    function _getOrderUserID(bytes ser_data) internal pure returns (uint32 userID) {
        userID = bytesToUint32(ORDER_SIZE, ser_data);
    }

    /**
     * @notice Get target token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenTarget Target token ID
     */
    function _getOrderTokenIDTarget(bytes ser_data) internal pure returns (uint16 tokenTarget) {
        tokenTarget = bytesToUint16(ORDER_SIZE - 4 , ser_data);
    }

    /**
     * @notice Get target token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountTarget Target token amount
     */
    function _getOrderAmountTarget(bytes ser_data) internal pure returns (uint256 amountTarget) {
        amountTarget = bytesToUint256(ORDER_SIZE - 6, ser_data);
    }

    /**
     * @notice Get trade token ID from the serialized order data
     * @param ser_data Serialized order data
     * @return tokenTrade Trade token ID
     */
    function _getOrderTokenIDTrade(bytes ser_data) internal pure returns (uint16 tokenTrade) {
        tokenTrade = bytesToUint16(ORDER_SIZE - 38, ser_data);
    }

    /**
     * @notice Get trade token amount from the serialized order data
     * @param ser_data Serialized order data
     * @return amountTrade Trade token amount
     */
    function _getOrderAmountTrade(bytes ser_data) internal pure returns (uint256 amountTrade) {
        amountTrade = bytesToUint256(ORDER_SIZE - 40, ser_data);
    }

    /**
     * @notice Check if the order is a buy order
     * @param ser_data Serialized order data
     * @return fBuy Is buy order or not
     */
    function _isOrderBuy(bytes ser_data) internal pure returns (bool fBuy) {
        fBuy = (bytesToUint8(ORDER_SIZE - 72, ser_data) & _MASK_IS_BUY != 0);
    }

    /**
     * @notice Check if the fee is paid by main token
     * @param ser_data Serialized order data
     * @return fMain Is the fee paid in main token or not
     */
    function _isOrderFeeMain(bytes ser_data) internal pure returns (bool fMain) {
        fMain = (bytesToUint8(ORDER_SIZE - 72, ser_data) & _MASK_IS_MAIN != 0);
    }

    /**
     * @notice Get nonce from the serialized order data
     * @param ser_data Serialized order data
     * @return nonce Nonce
     */
    function _getOrderNonce(bytes ser_data) internal pure returns (uint32 nonce) {
        nonce = bytesToUint32(ORDER_SIZE - 73, ser_data);
    }

    /**
     * @notice Get trading fee from the serialized order data
     * @param ser_data Serialized order data
     * @return fee Fee amount
     */
    function _getOrderTradeFee(bytes ser_data) internal pure returns (uint256 tradeFee) {
        tradeFee = bytesToUint256(ORDER_SIZE - 77, ser_data);
    }

    /**
     * @notice Get gas fee from the serialized order data
     * @param ser_data Serialized order data
     * @return fee Fee amount
     */
    function _getOrderGasFee(bytes ser_data) internal pure returns (uint256 gasFee) {
        gasFee = bytesToUint256(ORDER_SIZE - 109, ser_data);
    }

    /**
     * @notice Get v from the serialized order data
     * @param ser_data Serialized order data
     * @return v Signature v
     */
    function _getOrderV(bytes ser_data) internal pure returns (uint8 v) {
        v = bytesToUint8(ORDER_SIZE - 141, ser_data);
    }

    /**
     * @notice Get r from the serialized order data
     * @param ser_data Serialized order data
     * @return r Signature r
     */
    function _getOrderR(bytes ser_data) internal pure returns (bytes32 r) {
        r = bytesToBytes32(ORDER_SIZE - 142, ser_data);
    }

    /**
     * @notice Get s from the serialized order data
     * @param ser_data Serialized order data
     * @return s Signature s
     */
    function _getOrderS(bytes ser_data) internal pure returns (bytes32 s) {
        s = bytesToBytes32(ORDER_SIZE - 174, ser_data);
    }

    /**
     * @notice Get hash from the serialized order data
     * @param ser_data Serialized order data
     * @return hash Order hash without signature
     */
    function _getOrderHash(bytes ser_data) internal pure returns (bytes32 hash) {
        hash = keccak256(ser_data.slice(65, UNSIGNED_ORDER_SIZE));
    }

    /**
     * @notice Fetch the serialized order data with the given index
     * @param ser_data Serialized order data
     * @param index The index of order to be fetched
     * @return order_data The fetched order data
     */
    function _getOrder(bytes ser_data, uint index) internal pure returns (bytes order_data) {
        require(index < _getOrderCount(ser_data));
        order_data = ser_data.slice(ORDER_SIZE.mul(index), ORDER_SIZE);
    }

    /**
     * @notice Count the order amount
     * @param ser_data Serialized order data
     * @return amount Order amount
     */
    function _getOrderCount(bytes ser_data) internal pure returns (uint256 amount) {
        amount = ser_data.length.div(ORDER_SIZE);
    }
}
