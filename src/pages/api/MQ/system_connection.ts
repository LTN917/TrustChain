import type { NextApiRequest, NextApiResponse } from 'next';
import { connect } from 'amqplib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    // create rabbitMQ connection
    const connection = await connect('amqp://localhost:5276');
    const channel = await connection.createChannel();
    const queue = 'platform_data_queue';

    // assure MQ exist
    await channel.assertQueue(queue, { durable: true });

    // send platform data to queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(req.body)), { persistent: true });
    
    console.log('Data sent to queue:', req.body);
    await channel.close();
    await connection.close();

    res.status(200).json({ message: 'platform dataset send to queue' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
