import mongoose from "mongoose";

let cached = global.mongooseConn;

export const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  global.mongooseConn = mongoose.connection;
};