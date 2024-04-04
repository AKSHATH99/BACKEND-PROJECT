import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { tweet, username } = req.body;

  const user = await User.findOne({username})

  if(!user){
    throw new ApiError(404 , "USER NOT FOUND ")
  }

  const newTweet = new Tweet({
    content: tweet,
    owner: user._id,
  });

  // Save the tweet
  await newTweet.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "TWEET CREATED SUCCESSFULLY "));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const {username } = req.body;
  const user = await User.findOne({username})

  if(!user){
    throw new ApiError(404 , "USER NOT FOUND ")
  }

  const userId = user._id;
  const tweets =  await Tweet.find({owner : userId})
  // tweets.forEach(tweet => console.log(tweet.content))


  res.status(201).json(new ApiResponse(201, "TWEETS FETCHED  ", tweets))
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {id} = req.params
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid tweet ID.' });
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(id, {content:"UPDATED CONTEND"})

  if(!updatedTweet){
    throw new ApiError(404 , "TWEET NOT FOUND")
  }

  res.status(201).json(new ApiResponse(201, "TWEETS UPDATED  "))
  
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const {id} = req.params

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid tweet ID.' });
  }

  const deletedTweet = await Tweet.findByIdAndDelete(id)
  
  console.log(deletedTweet)
  if(!deletedTweet){
    throw new ApiError(404 , "TWEET NOT FOUND")
  }

  res.status(201).json(new ApiResponse(201, "TWEETS DELETED  "))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
