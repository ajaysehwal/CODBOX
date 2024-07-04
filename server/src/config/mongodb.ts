import mongoose from "mongoose";
export const Mongo_DB = async () => {
  const connectionString = process.env.Database_URL as string;
  try {
    await mongoose.connect(connectionString);
    console.log("Connection with database Stablized...");
  } catch (err: any) {
    console.log("Error connection to mongoDB", err.message);
  }
};
