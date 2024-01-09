//require('dotenv').config({path:'./env'}) //comman js that why ignore this syntax

import connectDb from './db/index.js'
import dotenv from 'dotenv'
import { app } from './app.js';

dotenv.config({
    path:'./.env'
})

//donnectDb is asynchronous method that's why it is returned a promise object we can handle it by .then method
connectDb().then(()=>{
    app.on("Errorr",(error)=>{
        console.log("error",error);
        throw error
    })

    app.listen((process.env.PORT || 8000),()=>{
        console.log(`Server start running at port ${process.env.PORT}`);
    })
}).catch((error)=>{
    console.log("MONGO DB CONNECTION FAILED !! ", error)
})







//first approach
/*
import express from 'express'
const app=express();

;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror",(error)=>{
            console.log("errr", error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening at ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("Error:-",error);
        throw error
        
    }
})()

*/