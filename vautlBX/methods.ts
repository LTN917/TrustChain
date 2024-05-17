
import axios from 'axios';

import { roid_address_smart_contract_instance } from '../blockchain/ethereum_env';

export { get_sign_tx}


// vaultBX API - create vaultBX wallet
async function create_vault_wallet(ro_id_hashing : string){
    try{
        const vaultbx_wallet_address = await axios.post(`http://127.0.0.1:8200/v1/blockchain/accounts/${ro_id_hashing}/address`, ro_id_hashing);
        console.log(`[API] vaultBX create wallet : ${vaultbx_wallet_address} [OK]`)
        return vaultbx_wallet_address;
    }catch(err){
        console.log(`[API] vaultBX Fail to create vaultBX wallet: ${err}`);
    }
}

// vaultBX API - sign_tx
async function send_sign_tx(ro_id_hashing : string, req_type: string){

    const tx_data = '0x' + Buffer.from(req_type, 'utf8').toString('hex');

    try{
        const sign_tx_response = await axios.post(`http://127.0.0.1:8200/v1/blockchain/accounts/${ro_id_hashing}/sign-tx`,
            {
                "address_to": process.env.PUBLIC_WALLET_ADDR,
                "chainID": "1", 
                "amount": "10",  
                "gas_price": "20000000000",  
                "gas_limit": "21000",  
                "nonce": "0",  
                "data": tx_data,  
                "is_private": false 
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
        console.log(`[API] vaultBX Fail to return sign_tx : ${err}`)
    }
}

// API - return the sign_tx of verified valid RO
async function get_sign_tx(ro_id_hashing : string, req_type : string){

    // get ro vaultBX wallet address (if ro doesn't have, create one)
    let ro_vaultbx_wallet_address = (await roid_address_smart_contract_instance).methods.getSmartContract(ro_id_hashing);

    if(ro_vaultbx_wallet_address == "0x0000000000000000000000000000000000000000"){
        ro_vaultbx_wallet_address = await create_vault_wallet(ro_id_hashing);
        (await roid_address_smart_contract_instance).methods.setVaultBX(ro_id_hashing, ro_vaultbx_wallet_address);
    }

    /* create two sign_tx 
        1. execute contract methods
        2. request public wallet to execute the tx
    */

    const exe_contract_methods_sign_tx = await send_sign_tx(ro_id_hashing, req_type);
    const req_public_wallet_ex_sign_tx = await send_sign_tx(ro_id_hashing, req_type = "req_public_wallet_execute");
    
    return [exe_contract_methods_sign_tx, req_public_wallet_ex_sign_tx];
}