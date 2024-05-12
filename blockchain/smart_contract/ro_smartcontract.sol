// smart contract for each RO


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RO_smart_contract is Ownable, Initializable {

    // 记录唯一标识符
    string public RO_id_hashing;

    // 数据认证映射表
    struct DataAuthEntry {
        string dataAuth;
        uint256 timestamp;
    }

    // sha256(data_id) => DataAuthEntry
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
    function set_data_auth(string memory data_id, string memory data_auth) public onlyOwner {
        dataAuthMap[data_id] = DataAuthEntry({
            dataAuth: data_auth,
            timestamp: block.timestamp
        });
    }

    // 驗證數據認證
    function verify_rp(string memory data_id, string memory rp_data) public onlyOwner view returns (bool) {
        DataAuthEntry memory entry = dataAuthMap[data_id];
        return keccak256(bytes(entry.dataAuth)) == keccak256(bytes(rp_data)) && entry.timestamp > 0;
    }
}