import type { NextApiRequest, NextApiResponse } from 'next';
import { roid_address_smart_contract_instance, deploy_ro_smartcontract, get_ro_smartcontract_contract_instance } from '../../../../blockchain/ethereum_env';
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

// 如果使用者有 smart contract 就拿來使用，沒有就創建一個
const get_ro_contract_address = async (Ro_id_hashing : string) => {

  const ro_contract_address = (await roid_address_smart_contract_instance).methods.getSmartContract(Ro_id_hashing);

  if(ro_contract_address == "0x0000000000000000000000000000000000000000"){
    let new_ro_contract_address = await deploy_ro_smartcontract(Ro_id_hashing)
    return new_ro_contract_address;
  }else{
    return ro_contract_address;
  }
}

// 使用合約方法上傳資料到鏈上
const deployOrInteractWithContract = async (entry_hashing:Entry_Hashing) => {

  const ro_smartcontract_address = await get_ro_contract_address(entry_hashing.RO_id_hash);
  const ro_smartcontract_instance = get_ro_smartcontract_contract_instance(ro_smartcontract_address);
  
  // 將 RO hashing 資料上鏈
  (await ro_smartcontract_instance).methods.set_data_auth(entry_hashing.data_id_hash, entry_hashing.data_auth_hash);
};

// ================================== upto_blockchain API ================================== 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try{
    if(req.method === 'POST'){
      
      // hashing req entry
      const entry_hashing = await dataHashing(req.body);

      // return valid send sign_tx
      const sign_tx = await get_sign_tx(entry_hashing.RO_id_hash, "data_up_to_blockchain");

      // up entry hashing to blockchain
      if(sign_tx){
        await deployOrInteractWithContract(entry_hashing);
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


