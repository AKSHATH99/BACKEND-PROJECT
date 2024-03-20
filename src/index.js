import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
connectDB()
  .then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR", error);
        throw error
    })
    app.listen(8000,()=>{
        console.log("listening to 8000 port ");
    } )
  })
  .catch((error) => {
    console.log("CONNECTION FAILED", error);
  });
