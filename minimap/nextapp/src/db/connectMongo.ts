import mongoose from "mongoose";

export default async function connectMongo() {
  console.log(process.env.MONGO_URL);
  return mongoose.connect(process.env.MONGO_URL!);
}
