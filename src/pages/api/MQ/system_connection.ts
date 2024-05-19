import type { NextApiRequest, NextApiResponse } from 'next';
import { connect } from 'amqplib';

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
      connection = await connect('amqp://localhost:5276');
      channel = await connection.createChannel();
      await channel.assertQueue(queue, {durable:true})
      await startConsumer();
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
    await ConsumerChannel.consume(queue,(msg:any)=>{
      if(msg){
        console.log('Received:', msg.content.toString());
        api_upto_blockchain(msg.content.toString()); // API - processing after receiving the data
        ConsumerChannel.ack(msg);
      }
    });
  }catch(err){
    console.log(`Fail to start consumer: ${err}`)
  }
}

// API - processing after consumer receiving data
import axios from 'axios';
async function api_upto_blockchain(msgContent:string){
  try{
    const data = JSON.parse(msgContent);
    const response = await axios.post('http://localhost:3000/api/blockchain/upto_blockchain',data);
    console.log(`API Response: ${response}`) // return the result of processing
  }catch(err){
    console.log(`[API] Consumer Fail to use processing data API: ${err}`);
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
        console.log(`Increased consumers to ${consumer_number}`);
      }
    } else if (consumer_number > 1 && messageCount / consumer_number < 20) {
      // Logic to reduce consumers if needed, ensuring at least one consumer remains
      consumer_number--;
      console.log(`Decreased consumers to ${consumer_number}`);
    }
  } catch (err) {
    console.log(`Fail to adjust Consumer: ${err}`);
  }
}


//  ================================== system_connection API  ================================== 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try{
    await initRabbitMQ();
    if (req.method === 'POST') {
      // platform send data to queue
      await channel.sendToQueue(queue, Buffer.from(JSON.stringify(req.body)), { persistent: true });
      console.log('Data sent to queue:', req.body);
      res.status(200).json({ message: 'platform dataset send to queue' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }catch(err){
    console.error(`[API] system_connection request failed: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }finally{
    await finRabbitMQ();
  }
}
