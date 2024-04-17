import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//--------------------CREATE CHANNEL---------------------------------------------------------
const createChannel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if(!id){
    throw new ApiError(422 , "Didnt recieve id from the params")
  }

  try {
    const NewChannel = await Subscription.create({
      channel: id,
      subscriber: null,
    });

    if (!NewChannel) {
      throw new ApiError(400, "Couldnt create new user ");
    }

    res.status(200).json(new ApiResponse(200, "Created user successfully "));
  } catch (error) {
    console.log(error);
  }
});


//--------------------TOGGLE SUBSCRIPTION-----------------------------------------------------
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!channelId){
    throw new ApiError(422 , "Didnt recieve id from the params")
  }

  try {
    const channel = await Subscription.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "CHANNEL NOT FOUND");
    }
    //toggle subscription
    if (req.user && channel.subscriber) {
      channel.subscriber = null;
      await channel.save();
      res.status(200).json(new ApiResponse(200, "Unsubscribed succesfully "));

    } else if (req.user) {
      channel.subscriber = req.user_id;
      await channel.save();
      res.status(200).json(new ApiResponse(200, " Subscribed successfully "));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "Something went wrong while toggling your subscription: Try again later",
    );
  }
});


//----------------------GET SUBSCRIBERS LIST----------------------------------------------------
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!channelId){
    throw new ApiError(422 , "Didnt recieve id from the params")
  }

  const subscribers = await Subscription.find({ channel: channelId });
  if (!subscribers) {
    res.status(400).json(new ApiResponse(400, "NO CHANNEL "));
  }

  //MAP THROUGH THE LIST AND COLLECT ONLY SUBSCRIBERS
  const subscriberlist = subscribers.map((listItem) => listItem.channel);
  console.log(subscriberlist);
  res
    .status(400)
    .json(new ApiResponse(400, "FETCHED SUBSCRIBERS", subscribers));
});



//------------------------GET CHANNELS USER SUBSCRIBED-------------------------------------
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if(!subscriberId){
    throw new ApiError(422 , "Didnt recieve id from the params")
  }

  const user = await Subscription.find({ subscriber: subscriberId });
  if (!user) {
    throw new ApiError(404, "Not subscribed to any channels yet ");
  }

  channelList = user.map((channel) => channel.channel);
  console.log(channelList);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelIds,
        "Subscribed channels fetched successfully",
      ),
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  createChannel,
};
