// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URL}/${DB_NAME}`,
//     );
//     console.log(`CONNECTED TO DB HOST : ${connectionInstance}`);
//   } catch (error) {
//     console.log("CONNECTION ERROR : ", error);
//     process.exit(1);
//   }
// };

// export default connectDB;
import dotenv from "dotenv";
dotenv.config({path: 'public\temp\.env'});
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


 // Load environment variables from .env file

const MONGODB_PASSWORD = process.env.MONGODB_URL_PASSWORD;    

const connectDB = async () => {
  try {
    console.log(`Connection String: mongodb+srv://akshath:${MONGODB_PASSWORD}@cluster0.kek2ckn.mongodb.net/${DB_NAME}`);

    const connectionInstance = await mongoose.connect(
      
      `mongodb+srv://akshath:${MONGODB_PASSWORD}@cluster0.kek2ckn.mongodb.net/${DB_NAME}`
      
    );
    console.log(
      `\n  MONGO DB CONNECTED .. DB HOST : ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("connection error : ", error);
    process.exit(1);
  }
};


export default connectDB;
