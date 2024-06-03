// for server to find the vaultBX wallet and smart contract address of RO

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Roid_address is Ownable {
    // Mapping for roid to vaultBX address
    mapping(string => address) private roidVaultBX;

    // Mapping for roid to smart contract address
    mapping(string => address) private roidSmartContract;

    // Mapping for data_id_hash to ro_id_hashing
    mapping(string => string) private dataidRoid;

    // Modified constructor to pass initial owner
    constructor() Ownable(msg.sender) {
        // Pass the initial owner address to the Ownable contract
    }

    // Function to set or update the vaultBX address for a given roid
    function setVaultBX(string memory roid_hashing, address vaultBX_address) public onlyOwner {
        roidVaultBX[roid_hashing] = vaultBX_address;
    }

    // Function to set or update the smart contract address for a given roid
    function setSmartContract(string memory roid_hash, address smartContract_address) public onlyOwner {
        roidSmartContract[roid_hash] = smartContract_address;
    }

    function setDataidRoid(string memory dataid_hash, string memory roid_hash) public onlyOwner() {
        dataidRoid[dataid_hash] = roid_hash;
    }

    // Function to verify if the given vaultBX matches the stored address for the roid
    function verifyVaultBX(string memory roid_hashing, address vaultBX_address) public view returns (bool) {
        return roidVaultBX[roid_hashing] == vaultBX_address;
    }

    // Function to retrieve the smart contract address associated with a given roid
    function getVaultBX(string memory roid_hashing) public onlyOwner view returns (address) {
        return roidVaultBX[roid_hashing];
    }

    // Function to retrieve the smart contract address associated with a given roid
    function getSmartContract(string memory roid_hashing) public onlyOwner view returns (address) {
        return roidSmartContract[roid_hashing];
    }

    function getRoid(string memory dataid_hash) public onlyOwner() view returns (string memory){
        return dataidRoid[dataid_hash];
    }
}
