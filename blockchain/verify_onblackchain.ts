import type { NextApiRequest, NextApiResponse } from 'next';
import { web3, roid_address_smart_contract_instance, deploy_ro_smartcontract, get_ro_smart_contract_instance, get_roid_address } from './ethereum_env';
import { get_sign_tx } from '../vautlBX/methods';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export { verify_onblockchain };

const storageFilePath = path.join(process.cwd(), 'roid_address.txt');

// SHA-256
const sha256 = (data: string) => crypto.createHash('sha256').update(data).digest('hex');

// Entry
type Entry = {
  RP_id: string;
  data_id: string;
  data_auth : {
    roles: string[];
    goals: string[];
  };
}

// Entry_Hashing
type Entry_Hashing = {
  RP_id_hash: string;
  data_id_hash: string;
  data_auth_hash: {
    roles: string[];
    goals: string[];
  };
}

// return the format of entry
const dataFormatting = async (entry:Entry) => {

    const entry_hashing : Entry_Hashing = {
      RP_id_hash: entry.RP_id,
      data_id_hash: sha256(entry.data_id),
      data_auth_hash: {
        roles: entry.data_auth.roles,
        goals: entry.data_auth.goals,
      },
    }

    console.log("[dataHashing] Hashing [OK]");

    return entry_hashing;
}

// ================================== verify_onblockchain ================================== 
export default async function verify_onblockchain(entry : Entry) {
  try{
    // hashing req entry
    const entry_hashing = await dataFormatting(entry);

    // get roid by dataid
    const address = await fs.readFile(storageFilePath, 'utf8');
    let roid_hashing = await (await get_roid_address(address)).methods.getRoid(entry_hashing.data_id_hash).call();

    // return verify result
    console.log(`[smart contract method] get verify result ...`);
    const verify_result = await get_sign_tx(roid_hashing, "verify_onblockchain", [entry_hashing.data_id_hash, entry_hashing.data_auth_hash.roles,  entry_hashing.data_auth_hash.goals]);
    console.log('[test]', verify_result);
    console.log(`[smart contract method] RP '${entry.RP_id}' usage of data '${entry.data_id}' verify result : '${verify_result[0]}'`);
  }catch (err){
    console.error(`[verify_onblockchain] entry up to blockchain failed: ${err}`);
  }
}