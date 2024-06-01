import type { NextApiRequest, NextApiResponse } from 'next';
import { web3, roid_address_smart_contract_instance, deploy_ro_smartcontract, get_ro_smart_contract_instance } from './ethereum_env';
import { get_sign_tx } from '../vautlBX/methods';
import crypto from 'crypto';

export { upto_blockchain };

// SHA-256
const sha256 = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

// Entry
type Entry = {
  RO_id: string;
  data_id: string;
  data_auth : {
    roles: string[];
    goals: string[];
  };
}

// Entry_Hashing
type Entry_Hashing = {
  RO_id_hash: string;
  data_id_hash: string;
  data_auth_hash: {
    roles: string[];
    goals: string[];
  };
}

// return the format of entry
const dataFormatting = async (entry:Entry) => {

    const entry_hashing : Entry_Hashing = {
      RO_id_hash: sha256(entry.RO_id),
      data_id_hash: sha256(entry.data_id),
      data_auth_hash: {
        roles: entry.data_auth.roles,
        goals: entry.data_auth.goals,
      },
    }

    console.log("[dataHashing] Hashing [OK]");

    return entry_hashing;
}

// ================================== upto_blockchain ================================== 
export default async function upto_blockchain(entry : Entry) {
  try{
    // hashing req entry
    const entry_hashing = await dataFormatting(entry);

    // return sign_tx of RO
    const signed_transaction = await get_sign_tx(entry_hashing.RO_id_hash, "data_up_to_blockchain", [entry_hashing.data_id_hash, entry_hashing.data_auth_hash.roles,  entry_hashing.data_auth_hash.goals]);
    // up entry hashing to blockchain
    if(signed_transaction){
      try {
        const receipt = await web3.eth.sendSignedTransaction(signed_transaction);
        console.log('[upto_blockchain] Transaction sent tx_receipt:', receipt);
        console.log(`[upto_blockchain] data up to blockchain for data : ${entry_hashing.data_id_hash} [OK]`);
      } catch (error) {
        console.error('[upto_blockchain] Failed to send sign_tx_by_vaultBX:', error);
      }
    }
  }catch (err){
    console.error(`[upto_blockchain] entry up to blockchain failed: ${err}`);
  }
}