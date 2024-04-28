// for server to find the vaultBX wallet and smart contract address of RO

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Roid_address is Ownable {
    // Mapping for roid to vaultBX address
    mapping(bytes32 => address) private roidVaultBX;

    // Mapping for roid to smart contract address
    mapping(bytes32 => address) private roidSmartContract;

    // Function to set or update the vaultBX address for a given roid
    function setVaultBX(bytes32 roid, address vaultBX) public onlyOwner {
        roidVaultBX[roid] = vaultBX;
    }

    // Function to set or update the smart contract address for a given roid
    function setSmartContract(bytes32 roid, address smartContract) public onlyOwner {
        roidSmartContract[roid] = smartContract;
    }

    // Function to verify if the given vaultBX matches the stored address for the roid
    function verifyVaultBX(bytes32 roid, address vaultBX) public view returns (bool) {
        return roidVaultBX[roid] == vaultBX;
    }

    // Function to retrieve the smart contract address associated with a given roid
    function getSmartContract(bytes32 roid) public onlyOwner view returns (address) {
        return roidSmartContract[roid];
    }
}
