import type { NextApiRequest, NextApiResponse } from 'next';
import { connect } from 'amqplib';

import { upto_blockchain } from '../../../../blockchain/upto_blockchain';
import { deploy_roid_address } from '../../../../blockchain/ethereum_env';

// queue setting
let connection:any;
let channel:any;
let queue = 'platform_data_queue';

// consumer setting
let consumer_number = 1;
let max_consumer_number = 5;
let intervalId:NodeJS.Timeout;
let activeTasks = 0; 

// Entry
type Entry = {
  RO_id: string;
  data_id: string;
  data_auth : {
    roles: string[];
    goals: string[];
  };
}

// raw data to Entry
function formatEntry(data: any): Entry {
  if (!data.RO_id || !data.data_id || !data.data_auth || !Array.isArray(data.data_auth.roles) || !Array.isArray(data.data_auth.goals)) {
    throw new Error('Invalid data structure');
  }

  return {
    RO_id: data.RO_id,
    data_id: data.data_id,
    data_auth: {
      roles: data.data_auth.roles,
      goals: data.data_auth.goals
    }
  };
}

// start RabbitMQ queue service
async function initRabbitMQ(){
  try{
    if(!connection){
      console.log('[initRabbitMQ] Trying to connect and create channel...');
      connection = await connect('amqp://localhost:5672').catch(e => console.log('[initRabbitMQ] Connection failed:', e));
      channel = await connection.createChannel();
      console.log('[initRabbitMQ] connect and create channel [OK]');

      await channel.assertQueue(queue, {durable:true});
      console.log(`[initRabbitMQ] assert queue ${queue} [OK]`);
    }
  }catch (err){
    console.log(`[initRabbitMQ] Fail to init : ${err}`)
  }
}

// close RabbitMQ and queue service
async function closeRabbitMQ() {
  while (activeTasks > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  // adjustConsumer
  clearInterval(intervalId);
  // no active task and close 
  await channel.close();
  await connection.close();
}

// start a consumer 
async function startConsumer(){
  try{
    console.log('[startConsumer] consumer setting...');
    const ConsumerChannel = await connection.createChannel();
    await ConsumerChannel.prefetch(1); // consumer fetch 1 data once
    console.log('[startConsumer] consumer setting [OK]');

    // consuming data from queue
    await ConsumerChannel.consume(queue, async(msg:any)=>{
      activeTasks++;
      if(msg){
        const entryContent = msg.content.toString();
        const entryData : Entry = JSON.parse(entryContent);
        console.log('[Consumer] consumer received: ', entryData);
        console.log('[Consumer] data up to blockchain...');

        try{
          await upto_blockchain(entryData);
          ConsumerChannel.ack(msg);
          await new Promise(resolve => setTimeout(resolve, 10000)); // time buffer
        }catch(err){
          console.error('[Consumer] fail to receiving data and retry...', err);
          ConsumerChannel.nack(msg, false, true); // Re-send data to queue
        }finally{
          activeTasks--;
        }
      }
    });
  }catch(err){
    console.log(`[startConsumer] Fail to start: ${err}`)
  }
}


// adjust number of consumers
async function adjustConsumers(){
  try {
    const { messageCount } = await channel.checkQueue(queue);
    if (messageCount > 100 && consumer_number < max_consumer_number) {
      while (messageCount / consumer_number > 50 && consumer_number < max_consumer_number) {
        await startConsumer();
        consumer_number++;
        console.log(`[adjustConsumers] Increased consumers to ${consumer_number}`);
      }
    } else if (consumer_number > 1 && messageCount / consumer_number < 20) {
      // Logic to reduce consumers if needed, ensuring at least one consumer remains
      consumer_number--;
      console.log(`[adjustConsumers] Decreased consumers to ${consumer_number}`);
    }
  } catch (err) {
    console.log(`[adjustConsumers] Fail to adjust: ${err}`);
  }
}



//  ================================== system_connection API  ================================== 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try{
    if (req.method === 'POST') {
      console.log(`============================= [Trust Chain] start connect ${"test_platform"} =============================`)
      // init roid_address smart contract
      await deploy_roid_address("test_platform");
      // init rabbitMQ setting
      await initRabbitMQ();
      await startConsumer();
      intervalId=setInterval(adjustConsumers, 60000); // adjust consumers
      // platform send data to queue
      for (const raw_entry of req.body) {
        let entry = formatEntry(raw_entry);
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(entry)), { persistent: true });
      }      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Delay to process messages

      res.status(200).json({ message: 'Finished processing all messages.' });

    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`[API-system_connection] Method ${req.method} Not Allowed`);
    }
  }catch(err){
    console.error(`[API-system_connection] request failed: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }finally{
    await closeRabbitMQ();
  }
}