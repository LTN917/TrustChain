import type { NextApiRequest, NextApiResponse } from 'next';
import { connect } from 'amqplib';

import { upto_blockchain } from '../../../../blockchain/upto_blockchain';

// queue setting
let connection:any;
let channel:any;
let queue = 'platform_data_queue';

// consumer setting
let consumer_number = 1;
let max_consumer_number = 5;
let intervalId:NodeJS.Timeout;

// start RabbitMQ queue service
async function initRabbitMQ(){
  try{
    if(!connection){
      console.log('[system_connection-initRabbitMQ] Trying to connect and create channel...');
      connection = await connect('amqp://localhost:5672').catch(e => console.log('[system_connection - initRabbitMQ] Connection failed:', e));
      channel = await connection.createChannel();
      console.log('[system_connection-initRabbitMQ] connect and create channel [OK]');

      await channel.assertQueue(queue, {durable:true});
      await startConsumer();
      console.log('[system_connection-initRabbitMQ] queue and consumer setting done [OK]')

      intervalId=setInterval(adjustConsumers, 60000); // adjust consumers
    }
  }catch (err){
    console.log(`Fail to init RabbitMQ: ${err}`)
  }
}

// finish RabbitMQ queue service
async function finRabbitMQ(){
  clearInterval(intervalId);
  try {
    if (channel) {
      await channel.close();
      channel = null;  // Nullify the global reference
    }
    if (connection) {
      await connection.close();
      connection = null;  // Nullify the global reference
    }
  }catch(err){
    console.log(`Fail to close RabbitMQ: ${err}`)
  }
}

// start a consumer 
async function startConsumer(){
  try{
    const ConsumerChannel = await connection.createChannel();
    await ConsumerChannel.prefetch(1); // fair dispatch
    console.log('[system_connection-startConsumer] consumer setting [OK]')
    await ConsumerChannel.consume(queue,(msg:any)=>{
      if(msg){
        console.log('[system_connection-startConsumer] consumer received:', msg.content.toString());

        console.log('[system_connection-startConsumer] data up to blockchain...');
        upto_blockchain(msg.content.toString()); // blockchain/upto_blockchain
        ConsumerChannel.ack(msg);
      }
    });
  }catch(err){
    console.log(`[system_connection-startConsumer] Fail to start consumer: ${err}`)
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
        console.log(`[system_connection-adjustConsumers] Increased consumers to ${consumer_number}`);
      }
    } else if (consumer_number > 1 && messageCount / consumer_number < 20) {
      // Logic to reduce consumers if needed, ensuring at least one consumer remains
      consumer_number--;
      console.log(`[system_connection-adjustConsumers] Decreased consumers to ${consumer_number}`);
    }
  } catch (err) {
    console.log(`[system_connection-adjustConsumers] Fail to adjust Consumer: ${err}`);
  }
}


//  ================================== system_connection API  ================================== 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try{
    await initRabbitMQ();
    if (req.method === 'POST') {
      // platform send data to queue      
      await channel.sendToQueue(queue, Buffer.from(JSON.stringify(req.body)), { persistent: true });
      console.log('[API-system_connection] Data sent to queue:', req.body);
      res.status(200).json({ message: 'platform dataset send to queue' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`[API-system_connection] Method ${req.method} Not Allowed`);
    }
  }catch(err){
    console.error(`[API-system_connection] request failed: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }finally{
    await finRabbitMQ();
  }
}
