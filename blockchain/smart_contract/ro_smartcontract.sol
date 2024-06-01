// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RO_smart_contract is Ownable, Initializable {

    string public RO_id_hashing;

    struct DataAuthEntry {
        string[] roles;
        string[] goals;
        uint256 timestamp;
    }

    mapping(string => DataAuthEntry) public dataAuthMap;

    // Define event for setting data authorization and potential errors
    event DataAuthSet(string indexed dataId, bool success, string message);
    event ErrorOccurred(string indexed dataId, string message);

    constructor(string memory _RO_id_hashing) Ownable(msg.sender) {
        initialize(_RO_id_hashing);
    }

    function initialize(string memory _RO_id_hashing) public initializer {
        RO_id_hashing = _RO_id_hashing;
        transferOwnership(msg.sender);
    }

    function set_data_auth(string memory data_id, string[] memory _roles, string[] memory _goals) public onlyOwner {
        // Use internal function to set data authorization
        bool result = setInternalDataAuth(data_id, _roles, _goals);
        if (result) {
            emit DataAuthSet(data_id, true, "Data authorization set successfully");
        } else {
            emit DataAuthSet(data_id, false, "Failed to set data authorization");
            emit ErrorOccurred(data_id, "Check data structure or state limits");
        }
    }

    // Internal function to handle data setting logic
    function setInternalDataAuth(string memory data_id, string[] memory _roles, string[] memory _goals) internal returns (bool) {
        // Here you can add more complex checks or operations
        bool isSuccessful = true;
        // Ensure no array overflow or other conditions
        assert(_roles.length < 100 && _goals.length < 100);
        dataAuthMap[data_id] = DataAuthEntry({
            roles: _roles,
            goals: _goals,
            timestamp: block.timestamp
        });
        return isSuccessful;
    }

    // Updated verify_rp function to use the updated structure
    function verify_rp(string memory data_id, string[] memory _roles, string[] memory _goals) public view onlyOwner returns (bool, string memory){
        DataAuthEntry storage entry = dataAuthMap[data_id];
        // Check if the data entry exists
        if (entry.timestamp == 0) {
            return (false, "[PASS Failed] No data entry found for this data_id");
        }

        // Check roles
        for (uint i = 0; i < _roles.length; i++) {
            bool roleFound = false;
            for (uint j = 0; j < entry.roles.length; j++) {
                if (keccak256(abi.encodePacked(_roles[i])) == keccak256(abi.encodePacked(entry.roles[j]))) {
                    roleFound = true;
                    break;
                }
            }
            if (!roleFound) {
                return (false, "[PASS Failed] RP roles are invalid");
            }
        }

        // Check goals
        for (uint i = 0; i < _goals.length; i++) {
            bool goalFound = false;
            for (uint j = 0; j < entry.goals.length; j++) {
                if (keccak256(abi.encodePacked(_goals[i])) == keccak256(abi.encodePacked(entry.goals[j]))) {
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