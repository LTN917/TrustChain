
import axios from 'axios';

import { web3, roid_address_smart_contract_instance, deploy_ro_smartcontract, get_ro_contract_address, get_ro_smartcontract_contract_instance } from '../blockchain/ethereum_env';

export { get_sign_tx}


// get vaultBX wallet address
async function get_vaultBX_wallet_address(ro_id_hashing : string){
    let ro_vaultbx_wallet_address = (await roid_address_smart_contract_instance).methods.getSmartContract(ro_id_hashing);

    if(ro_vaultbx_wallet_address == "0x0000000000000000000000000000000000000000"){
        ro_vaultbx_wallet_address = await create_vault_wallet(ro_id_hashing);
        (await roid_address_smart_contract_instance).methods.setVaultBX(ro_id_hashing, ro_vaultbx_wallet_address);
    }
    
    return ro_vaultbx_wallet_address;
}


// vaultBX API - create vaultBX wallet
async function create_vault_wallet(ro_id_hashing : string){
    try{
        const vaultbx_wallet_address = await axios.post(`http://127.0.0.1:8200/v1/blockchain/accounts/${ro_id_hashing}/address`, ro_id_hashing);
        return vaultbx_wallet_address;
    }catch(err){
        console.log(`[vaultBX-create_vault_wallet] vaultBX Fail to create vaultBX wallet: ${err}`);
    }
}

// vaultBX API - sign_tx
async function send_sign_tx(ro_id_hashing : string, tx: any){

    try{
        const sign_tx_response = await axios.post(`http://127.0.0.1:8200/v1/blockchain/accounts/${ro_id_hashing}/sign-tx`,
            {
                "address_from" : tx.ro_vaultbx_wallet_address,
                "address_to" : tx.ro_contract_address,
                "chainID" : tx.chainID, 
                "amount" : tx.amount,  
                "gas_price" : tx.gas_price,  
                "gas_limit" : tx.gas_limit,  
                "nonce" : tx.nonce,  
                "data" : tx.data,  
                "is_private" : tx.is_private 
            },
            {
                headers: {
                    "X-Vault-Token":"root",
                }
            }
        );
        return sign_tx_response;
        /*
            {
                "request_id": "67089e8b-c8c2-958c-3e2e-6610937dda28",
                "lease_id": "",
                "renewable": false,
                "lease_duration": 0,
                "data": {
                    "address_from": "0x9f1621421d1b984ef39d261a6ae4caa1c17f72ed",
                    "address_to": "0xa1a7be6a19d14911da4b03141270fb479b921e8c",
                    "amount": "10",
                    "gas_limit": 21000,
                    "gas_price": "20000000000",
                    "signed_transaction": "0xf866808504a817c80082520894a1a7be6a19d14911da4b03141270fb479b921e8c0a82a30025a0b02602c68f98c2a545f08ec72ce8195181fcd169b242df7fcff692d9bce19188a02aa30b0122ac7d7d042525d47071d81f2bec2227e225dfcf9558f3c63b4d90fd",
                    "transaction_hash": "0x2dd794bf70aec9ede29f0e80efbd0df630f528b4ec052ee6cf8358979f8e9925"
                },
                "wrap_info": null,
                "warnings": null,
                "auth": null
                }
        */
    }catch(err){
        console.log(`[vaultBX - send_sign_tx] vaultBX Fail to return sign_tx : ${err}`)
    }
}

// API - return the sign_tx of verified valid RO
async function get_sign_tx(ro_id_hashing : string, tx_type : string, tx_data : any){

    console.log(`[vaultBX-get_sign_tx] ro '${ro_id_hashing}' sign for tx...`);

    // get or create RO vaultBX wallet address and smart contract address
    let ro_vaultbx_wallet_address = await get_vaultBX_wallet_address(ro_id_hashing);
    console.log(`[vaultBX-get_sign_tx] get ro vault wallet : ${ro_vaultbx_wallet_address} [OK]`);

    let ro_contract_address = await get_ro_contract_address(ro_id_hashing);
    console.log(`[vaultBX-get_sign_tx] get ro smart contract : ${ro_contract_address} [OK]`);

    // create sign_tx- execute contract methods
    let sign_tx = null;
    let signed_transaction = null;

    if (tx_type == 'data_up_to_blockchain'){
        const data = await (await get_ro_smartcontract_contract_instance(ro_contract_address))
                        .methods.set_data_auth(tx_data[0], tx_data[1]).encodeABI();
        const tx = {
            address_from : process.env.PUBLIC_WALLET_ADDR,
            address_to : ro_contract_address,
            chainID : "31337", 
            amount : "10",  
            gas_price : await web3.eth.getGasPrice(),  
            gas_limit : await web3.eth.estimateGas({ to: ro_contract_address, data: data }),  
            nonce : await web3.eth.getTransactionCount(ro_vaultbx_wallet_address, 'latest'),  
            data : data,  
            is_private : false 
        };

        sign_tx = await send_sign_tx(ro_id_hashing, tx)
        signed_transaction = sign_tx?.data.signed_transaction;

        console.log(`[vaultBX-get_sign_tx] get sign_tx`)
        
    }else if(tx_type == 'verify_rp'){

    }

    return (signed_transaction == null) ? signed_transaction : "null";
}