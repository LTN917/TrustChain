// smart contract for each RO


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RO_smart_contract is Ownable, Initializable {

    // 记录唯一标识符
    string public RO_id_hashing;

    // data_auth_format
    struct DataAuthFormat {
        string[] roles;
        string[] goals;
    }

    // 数据认证映射表
    struct DataAuthEntry {
        DataAuthFormat dataAuth;
        uint256 timestamp;
    }

    /* sha256(data_id) => DataAuthFormat {
            string[] roles;
            string[] goals;
        }
    */
    mapping(string => DataAuthEntry) public dataAuthMap;

    // Modified constructor to pass initial owner
    constructor(string memory _RO_id_hashing) Ownable(msg.sender) {
        initialize(_RO_id_hashing);
    }


    // 合约初始化方法
    function initialize(string memory _RO_id_hashing) public initializer {
        RO_id_hashing = _RO_id_hashing;
        transferOwnership(msg.sender);  // 将合约所有者设置为部署者
    }

    // 修改或新增數據驗證
    function set_data_auth(string memory data_id, DataAuthFormat memory data_auth) public onlyOwner {
        dataAuthMap[data_id] = DataAuthEntry({
            dataAuth: data_auth,
            timestamp: block.timestamp
        });
    }

    // 驗證數據認證
    function verify_rp(string memory data_id, DataAuthFormat memory rp_data) public view onlyOwner returns (bool, string memory) {
        DataAuthEntry memory entry = dataAuthMap[data_id];

        // Check if the data entry exists
        if (entry.timestamp == 0) {
            return (false, "[PASS Failed] No data entry found for this data_id");
        }

        // Check roles
        for (uint i = 0; i < rp_data.roles.length; i++) {
            bool roleFound = false;
            for (uint j = 0; j < entry.dataAuth.roles.length; j++) {
                if (keccak256(abi.encodePacked(rp_data.roles[i])) == keccak256(abi.encodePacked(entry.dataAuth.roles[j]))) {
                    roleFound = true;
                    break;
                }
            }
            if (!roleFound) {
                return (false, "[PASS Failed] RP roles are invalid");
            }
        }

        // Check goals
        for (uint i = 0; i < rp_data.goals.length; i++) {
            bool goalFound = false;
            for (uint j = 0; j < entry.dataAuth.goals.length; j++) {
                if (keccak256(abi.encodePacked(rp_data.goals[i])) == keccak256(abi.encodePacked(entry.dataAuth.goals[j]))) {
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