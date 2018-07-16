pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ECRecovery.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title Dinngo
 * @author Ben Huang
 * @notice Main exchange contract for Dinngo
 */
contract Dinngo is Ownable {
    using SafeMath for uint256;
    using ECRecovery for bytes32;
    using SafeERC20 for ERC20;

    mapping (address => mapping (address => uint256)) private balance;
    mapping (uint256 => address) private userID;
    mapping (address => uint8) private userRank;
    uint256 private userCount;
    mapping (uint256 => address) private tokenID;
    mapping (address => uint8) private tokenRank;
    uint256 private tokenCount;

    event AddUser(uint256 userID, address user);
    event AddToken(uint256 tokenID, address token);
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    /**
     * @param dinngoWallet The main address of dinngo
     * @param dinngoToken The contract address of DGO
     */
    constructor (address dinngoWallet, address dinngoToken) public {
        userCount = 0;
        userID[0] = dinngoWallet;
        userRank[dinngoWallet] = 255;
        tokenID[1] = dinngoToken;
    }

    function deposit() external payable {
        require(msg.value > 0);
        balance[0][msg.sender] = balance[0][msg.sender].add(msg.value);
        addUser(msg.sender);
        emit Deposit(0, msg.sender, msg.value, balance[0][msg.sender]);
    }

    function depositToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        ERC20(token).safeTransferFrom(msg.sender, this, amount);
        balance[token][msg.sender] = balance[token][msg.sender].add(amount);
        addUser(msg.sender);
        emit Deposit(token, msg.sender, amount, balance[token][msg.sender]);
    }

    function addUser(address user) internal {
        if (userRank[user] != 0)
            return;
        userCount++;
        userID[userCount] = user;
        userRank[user] = 1;
        emit AddUser(userCount, user);
    }

    function addToken(address token) external onlyOwner {
        require(tokenRank[token] == 0);
        tokenCount++;
        tokenID[tokenCount] = token;
        tokenRank[token] = 1;
        emit AddToken(tokenCount, token);
    }

    function updateUserRank(address user, uint8 rank) external onlyOwner {
        require(userRank[user] != 0);
        userRank[user] = rank;
    }

    function updateTokenRank(address token, uint8 rank) external onlyOwner {
        require(tokenRank[token] != 0);
        tokenRank[token] = rank;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0);
        require(amount <= balance[0][msg.sender]);
        msg.sender.transfer(amount);
        balance[0][msg.sender] = balance[0][msg.sender].sub(amount);
        emit Withdraw(0, msg.sender, amount, balance[0][msg.sender]);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0));
        require(amount > 0);
        require(amount <= balance[token][msg.sender]);
        ERC20(token).safeTransfer(msg.sender, amount);
        balance[token][msg.sender] = balance[token][msg.sender].sub(amount);
        emit Withdraw(token, msg.sender, amount, balance[token][msg.sender]);
    }

    function getBalance(address token, address user) external view returns (uint256) {
        return balance[token][user];
    }

    function settle() public returns (bool) {
        return true;
    }

}
