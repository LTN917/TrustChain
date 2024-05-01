// smart contract for each RO


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RO_smart_contract is Ownable, Initializable {
    // 使用 OpenZeppelin 的 ECDSA 库来处理 SHA256 哈希和签名
    using ECDSA for bytes32;

    // 记录唯一标识符
    string public RO_id;

    // 数据认证映射表
    struct DataAuthEntry {
        bytes32 dataAuth;
        uint256 timestamp;
    }

    // sha256(data_id) => DataAuthEntry
    mapping(bytes32 => DataAuthEntry) public dataAuthMap;

    // 合约初始化方法
    function initialize(string memory _RO_id) public initializer {
        RO_id = _RO_id;
        transferOwnership(msg.sender);  // 将合约所有者设置为部署者
    }

    // 修改或新增數據驗證
    function set_data_auth(bytes32 data_id, bytes32 data_auth) public onlyOwner {
        dataAuthMap[data_id] = DataAuthEntry({
            dataAuth: data_auth,
            timestamp: block.timestamp
        });
    }

    // 驗證數據認證
    function verify_rp(bytes32 data_id, bytes32 rp_data) public onlyOwner view returns (bool) {
        DataAuthEntry memory entry = dataAuthMap[data_id];
        return entry.dataAuth == rp_data && entry.timestamp > 0;
    }
}