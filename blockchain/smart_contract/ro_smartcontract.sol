// smart contract for each RO


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RO_smart_contract is Ownable, Initializable {

    // 记录唯一标识符
    string public RO_id_hashing;

    // auth info of data
    mapping (string => string[]) public dataid_authroles;
    mapping (string => string[]) public dataid_authgoals;
    mapping (string => uint256) public dataid_timestamp;

    // Modified constructor to pass initial owner
    constructor(string memory _RO_id_hashing) Ownable(msg.sender) {
        initialize(_RO_id_hashing);
    }

    // 合约初始化方法
    function initialize(string memory _RO_id_hashing) public initializer {
        RO_id_hashing = _RO_id_hashing;
        transferOwnership(msg.sender);  // 将合约所有者设置為部署者
    }

    // 修改或新增數據驗證
    event Debug(string message);

    function set_data_auth(string memory data_id, string[] memory authroles, string[] memory authgoals) public onlyOwner {
        require(authroles.length > 0, "authroles array is empty");
        require(authgoals.length > 0, "authgoals array is empty");

        dataid_authroles[data_id] = authroles;
        dataid_authgoals[data_id] = authgoals;
        dataid_timestamp[data_id] = block.timestamp;

        emit Debug("Data set successfully");
    }

    // 驗證數據認證
    function verify_rp(string memory data_id, string[] memory rp_auth_roles, string[] memory rp_auth_goals) public view returns (bool, string memory) {

        // get auth info of data
        string[] memory data_authroles = dataid_authroles[data_id];
        string[] memory data_authgoals = dataid_authgoals[data_id];
        uint256 data_timestamp = dataid_timestamp[data_id];

        // Check if the data entry exists
        if (data_timestamp == 0) { 
            return (false, "[PASS Failed] No data entry found for this data_id");
        }

        // Check roles
        for (uint i = 0; i < rp_auth_roles.length; i++) {
            bool roleFound = false;
            for (uint j = 0; j < data_authroles.length; j++) {
                if (keccak256(abi.encodePacked(rp_auth_roles[i])) == keccak256(abi.encodePacked(data_authroles[j]))) {
                    roleFound = true;
                    break;
                }
            }
            if (!roleFound) {
                return (false, "[PASS Failed] RP roles are invalid");
            }
        }

        // Check goals
        for (uint i = 0; i < rp_auth_goals.length; i++) {
            bool goalFound = false;
            for (uint j = 0; j < data_authgoals.length; j++) {
                if (keccak256(abi.encodePacked(rp_auth_goals[i])) == keccak256(abi.encodePacked(data_authgoals[j]))) {
                    goalFound = true;
                    break;
                 }
            }
            if (!goalFound) {
                return (false, "[PASS Failed] RP goals are invalid");
            }
        }

        return (true, "[PASS] RP is valid in the verification");
    }
}