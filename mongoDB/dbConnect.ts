import mongoose from 'mongoose';

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

const dbConnect = async (): Promise<void> => {
  if (connection.isConnected) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in your environment variables');
  }
  console.log(`Connecting to MongoDB at: ${process.env.MONGO_URI}`);
  const db = await mongoose.connect(mongoUri);
  connection.isConnected = db.connections[0].readyState;
};

export default dbConnect;
