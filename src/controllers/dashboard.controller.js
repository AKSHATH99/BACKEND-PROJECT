import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  let channelStats = [];

  const subscriberCount = await Subscription.find({ channel: req.user._id });
  if (!subscriberCount) {
    throw new ApiError(404, "CHANNEL NOT FOUND");
  }

  const subscribers = subscriberCount.map(
    (eachSubscriber) => eachSubscriber.subscriber,
  );
  const totalSubscribers = subscribers.length;

  //PUSH THE LENGTH OF THE ARRAY INTO STATS , THAT IS THE TOTAL NUMBER OF SUBSCRIBER
  channelStats.push(totalSubscribers);

  //...........................NO OF VIDEOS AND NO OF LIKES ...................................
  const video = await Video.find({ owner: req.user._id });

  let viewSum;

  if (video.length === 0) {
    channelStats.push(0);
  } else {
    const numberOfvideos = video.length;
    channelStats.push(numberOfvideos);

    const totalViews = video.map((views) => (viewSum = viewSum + views.view));
    channelStats.push(totalViews);
  }

  //.............number of likes ..............................................
  const likes = await Like.find({
    video: { $in: video.map((video) => video._id) },
  });
  const totalLikes = likes.length;
  channelStats.push(totalLikes);

  res.status(200).json(new ApiResponse(200, "Channel stats fetched successfully", channelStats));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const user = req.user._id;

  const videos = await Video.find({ owner: user }).select("-isPublished");

  if (videos.length === 0) {
    res.status(200).json(new ApiResponse(200, "NO VIDEOS YET"));
  } else {
    res
      .status(200)
      .json(new ApiResponse(200, "Videos fetched successfully ", videos));
  }
});

export { getChannelStats, getChannelVideos };
