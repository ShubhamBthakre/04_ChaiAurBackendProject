import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb=async()=>{
    try {
    
        const connectionInstance=await mongoose.connect(`mongodb+srv://shubhamthakre:Shubham123@cluster0.5y3ufmx.mongodb.net/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        //Todo log connectionInstance
        console.log("connection Instance ",connectionInstance)
    } catch (error) {
        console.log("MongoDb connection failed",error);
        process.exit(1)
        
    }
}

export default connectDb;