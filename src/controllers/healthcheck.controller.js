import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const healthcheck = asyncHandler(async (req , res)=>{
    if(req){
        return res.status(200).json(
            new ApiResponse(200 , "SUCCESSLY REQUEST RECIEVED ")
        )
    }
    else{
        new ApiError(500 , "SOMETHING WENT WRONG ")
    }
})

export {
    healthcheck
}