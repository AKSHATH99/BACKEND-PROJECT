import { ApiError } from "../utils/apiError.js";
import asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


//Access the token from the req body and check to ensure it is correct , then adds the user object into req body
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        //or condititon for mobile apps , just in case if  json is not comming 
        const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        
        //compare accesstoken from req and use  the token secret to verufy authority
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
        
        //if all good , pass in user object to the request body so that next methods can access the data of body
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})



