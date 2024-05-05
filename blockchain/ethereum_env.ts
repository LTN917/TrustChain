import Web3 from 'web3';

// creating Web3 instance to localhost Ganache
const web3 = new Web3('http://localhost:7545');

// get ganache first wallet instance
const get_public_wallet = async() =>{
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
} 

export { web3, get_public_wallet };