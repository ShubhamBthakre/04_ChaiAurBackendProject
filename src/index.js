
//dotenv --> we are using dotenv because we want whenver code load we wanna provide env variable as soon as possible
//require('dotenv').config({path:'./env'}) //comman js that why ignore this syntax
//path:"./env" --> home directory ke andar hi .env file hai

//for module js we can mentioned dotenv syntax like this 
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})

// as above import dotenv syntax is not available in documents thats why we have to use this as experimental  we have to do some changes in package.json for dev script --> -r dotenv/config --experimental-json-modules //might for node version of v20 or more this experimental syntax deprecated that time we have to remore it from dev script tag

import connectDb from './db/index.js'

import { app } from './app.js';



//donnectDb is asynchronous method that's why it is returned a promise object we can handle it by .then method
connectDb().then(()=>{
    //app have many listeners some of them are app.on || we are checking here if is our app  listening to database
    app.on("Errorr",(error)=>{
        console.log("error",error);
        throw error //this will goes to error in catch
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