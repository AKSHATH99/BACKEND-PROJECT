import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

//-----------------------TOGGLE VIDEO LIKES------------------------------------------------
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if(!videoId){
    throw new ApiError(420 , "Didnt recieve videoId from params")
  }
  const Findvideo = Video.findById(videoId);
  if(!Findvideo){
    throw new ApiError(404 , "VIDEO NOT FOUND")
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "INCORRECT ID ");
  }

  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user._id,
    });

    //if video like  already exist , delete it , else create new one for that video ie like that video 
    if (existingLike) {
      await Like.deleteOne({ video: videoId, likedBy: req.user._id });

      res.status(200).json(new ApiResponse(200, "Unliked video"));
    } else {
      const newLike = await Like.create({ video: videoId, likedBy: userId });
      res
        .status(200)
        .json(new ApiResponse(200, newLike, "Like added successfully"));
    }
  } catch (error) {
    throw new ApiError(
      500,
      error,
      "Some error occurred while toggling video like: Try again later",
    );
  }
});


//---------------------------TOGGLE COMMENT LIKE-------------------------------------------
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if(!commentId){
    throw new ApiError(420 , "Didnt recieve videoId from params")
  }
  const findComment = Comment.findById(commentId);
  if(!findComment){
    throw new ApiError(404 , "Comment does not exist")
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "INCORRECT ID ");
  }

  const ExistingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

    //if comment like  already exist , delete it , else create new one for that comment ie like that video 
  if (ExistingLike) {
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, "Comment unliked"));
  } else {
    await Like.create({ comment: commentId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, "Comment liked"));
  }
});

//---------------------------TOGGLE TWEET LIKE--------------------------------------------
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "INCORRECT ID ");
  }
  const Findtweet = Tweet.findById(tweetId);
  if(!Findtweet){
    throw new ApiError(404 , "TWEET NOT FOUND")
  }

  const ExistingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

    //if tweet like  already exist , delete it , else create new one for that tweet ie like that video 
  if (ExistingLike) {
    await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, "Tweet unliked"));
  } else {
    await Like.create({ tweet: tweetId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, "Tweet liked"));
  }
});


//----------------------------FETCH ALL LIKED VIDEOS------------------------------------------
const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const videos = await Like.find({
    user: req.user._id,
    comment: null,
    tweet: null,
  });

  if (videos.length === 0) {
    res.status(200).json(new ApiResponse(200, "No videos liked yet "));
  } else {
    res.status(200).json(new ApiResponse(200, "Fetched Successfully", videos));
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
