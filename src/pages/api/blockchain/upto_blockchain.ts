import type { NextApiRequest, NextApiResponse } from 'next';
import { web3, get_public_wallet } from '../../../../blockchain/ethereum_env';
import crypto from 'crypto';

// public wallet

const public_wallet = get_public_wallet();

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
const dataFormatting = async (entry:Entry) => {

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

// return the address of RO's smart contract ( if not exist then create )
const get_ro_contract_address = async (Ro_id : string) => {

}

// 部署新合約或與現有合約互動
const deployOrInteractWithContract = async (entry_hashing:Entry_Hashing) => {

  // 如果使用者有 smart contract 就拿來使用，沒有就創建一個
  const ro_smartcontrat = get_ro_contract_address(entry_hashing.RO_id_hash);

  

};



// upto_blockchain API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try{
        if(req.method === 'POST'){
          // formatting req entry
          const entry_hashing = await dataFormatting(req.body);

          // up entry hashing to blockchain
          await deployOrInteractWithContract(entry_hashing);


            res.status(200).json({ message: 'Data received and processed', result: 'entry up to blockchain OK!' });
        }else{
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);      
        }
        
    }catch (err){
        console.error(`[API] upto_blockchain request failed: ${err}`);
        res.status(500).json({ error: 'Internal server error' });    
    }
}


