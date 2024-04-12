import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    const channel = await User.findById(channelId)

    if(!channel){
        throw new ApiError(400 , "CHANNEL NOT FOUND")
    }

    const channelInDB = await Subscription.findById(channelId);
})  

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = Subscription.findById(channelId);

    if(!subscribers){
        res.status(400).json(new ApiResponse(400 , "NO SUBSCRIBERS YET"))
    }

    res.status(400).json(new ApiResponse(400 , "FETCHED SUBSCRIBERS" , subscribers))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}