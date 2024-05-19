import type { NextApiRequest, NextApiResponse } from 'next';
import { web3, roid_address_smart_contract_instance, deploy_ro_smartcontract, get_ro_smartcontract_contract_instance } from '../../../../blockchain/ethereum_env';
import { get_sign_tx } from '../../../../vautlBX/methods';
import crypto from 'crypto';

// SHA-256
const sha256 = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

// Entry
type Entry = {
  RO_id: string;
  data_id: string;
  data_auth : {
    role: string[];
    goal: string[];
  };
}

// Entry_Hashing
type Entry_Hashing = {
  RO_id_hash: string;
  data_id_hash: string;
  data_auth_hash: {
    role: string[];
    goal: string[];
  };
}

// return the format of entry
const dataHashing = async (entry:Entry) => {

    // processing data_auth
    let role_hash = entry.data_auth.role.map((role:string) => sha256(role + entry.RO_id + entry.data_id))
    let goal_hash = entry.data_auth.role.map((goal:string) => sha256(goal + entry.data_id))

    const entry_hashing : Entry_Hashing = {
      RO_id_hash: sha256(entry.RO_id),
      data_id_hash: sha256(entry.data_id),
      data_auth_hash: {
        role: role_hash,
        goal: goal_hash,
      },
    }
    return entry_hashing;
}


// ================================== upto_blockchain API ================================== 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try{
    if(req.method === 'POST'){
      
      // hashing req entry
      const entry_hashing = await dataHashing(req.body);

      // return valid send sign_tx
      const signed_transaction = await get_sign_tx(entry_hashing.RO_id_hash, "data_up_to_blockchain", [entry_hashing.data_id_hash, entry_hashing.data_auth_hash]);

      // up entry hashing to blockchain
      if(signed_transaction){
        try {
          const receipt = await web3.eth.sendSignedTransaction(signed_transaction);
          console.log('Transaction sent! Receipt:', receipt);
      } catch (error) {
          console.error('Failed to send sign_tx_by_vaultBX:', error);
      }
        console.log(`[API] data up to blockchain for data : ${entry_hashing.data_id_hash} [OK]`)
        res.status(200).json({ message: 'Data received and up to blockchain', result: 'entry up to blockchain OK!' });
      }
      res.status(405).json({ message: 'the sign_tx of RO is not valid', result: 'entry up to blockchain Failed!' })
    }
      
  }catch (err){
    console.error(`[API] upto_blockchain request failed: ${err}`);
    res.status(500).json({ error: 'Internal server error' });    
  }
}


