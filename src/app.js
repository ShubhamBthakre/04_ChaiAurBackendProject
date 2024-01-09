import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";


/**
const app=express()

//We do use app.use for any configuration or to add middleware
app.use(cors({
origin:process.env.CORS_ORIGIN,
credentials:true
}))

//we can set the limit of json data how much that we can store in cookies
app.use(express.json({limit:"20kb"}))

//this configuration will parse the url and  represent reserved and unsafe characters in a URL (Uniform Resource Locator) by replacing them with a "%" followed by two hexadecimal digits.  (like space,%(percentage))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
Original URL: https://example.com/search?q=hello world
URL Encoded: https://example.com/search?q=hello%20world
In this example, the space in the query parameter "hello world" is encoded as %20 to make it a valid URL.


//this configuration allow us to store information (file,pdf) in speficific folder ("public")
app.use(express.static("public")) 
//public name is not mandetory we can set any folder name in current directory

//this configuration will allow us to access cookies store in client's browser by server only
app.use(cookieParser())


//import routes
import userRouter from './routes/user.route.js'

//routes declaration, express se routes seperate nikla isliye yeh syntax use kiya(Complete guide for router and controller with debugging 10.00 min)
app.use("/api/v1/users",userRouter)
//url path example:https:localhost:8000/api/v1/users/register          //aise url banenge
//url path example:https:localhost:8000/api/v1/users/login

export {app}

**/


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.route.js'


//routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app }