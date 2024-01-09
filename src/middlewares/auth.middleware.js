import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

//in professional code we pass parameter with ( _ ) if that is not in use

export const verifyJWT= asyncHandler(async(req,_,next)=>{
try {
    
        //req have access of cookies because of app.use(cookieParser()) || we set some cookies for req in user.controller.js file with .cookies() method
        // for some senario while mobile app development we will get token in headers || thats why we are checking both the condition
        console.log(req.cookies);
        const accessToken=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!accessToken){
            throw new ApiError(404,"unauthorized request")
        }
    
        console.log("verify",accessToken);

        const decodedToken= jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
        //by decodedToken we can access _id because in userSchema in generateAccessToken we have mentioned _id:this._id
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user){
            
            throw new ApiError(401,"Invalid access token")
        }
    
    
        //we are adding user here in req
        req.user=user;
    
        next()
} catch (error) {

    throw new ApiError(401, error?.message || "Invalid access token")
    
}


})

