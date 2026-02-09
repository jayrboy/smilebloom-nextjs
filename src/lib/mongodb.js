import mongoose from 'mongoose'

export async function connectMongoDB() {
  return mongoose.connect(process.env.MONGODB_URI);
}

export function disconnectMongoDB() {
  return mongoose.disconnect();
}
