import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  if (req) {
    console.log("got request");
  }

  res.status(200).json(new ApiResponse(200, "success"));
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console.log(req.user)
  console.log(title, description);
  const videoLocalPath = req.files.video[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;
  console.log(videoLocalPath);
  console.log(thumbnailLocalPath)

  if (!videoLocalPath) {
    throw new ApiError(400, "VIDEO FILE IS REQUIRED");
  }
  if(!thumbnailLocalPath){
    throw new ApiError(400 , "THUMBNAIL FILE IS REQUIRED")
  }

  const video =  await uploadOnCloudinary(videoLocalPath)
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

  if(!video){
    throw new ApiError(404 , "SOMETHING WENT WRONG WHILE UPLOADING TO CLOUDINARY ")
  }
  if(!thumbnail){
    throw new ApiError(404 , "SOMETHING WENT WRONG WHILE UPLOADING TO CLOUNDINARY (THUMBNAIL)")
  }

  console.log(video.url)
  console.log(video.duration)
  console.log(thumbnail.url)
  
  // TODO: get video, upload to cloudinary, create video

  const dbVideo = await Video.create({
    videoFile: video.url,
    thumbnail:thumbnail.url,
    title:title,
    description:description,
    duration : video.duration,
    owner: req.user._id
  })

  console.log(dbVideo)
  const uploadedVideo = await Video.findById(dbVideo._id)

  if(!uploadedVideo){
    throw new ApiError(500 , "SOMETHING WRONG WHILE UPLAODING VIDEO TO DB ")
  }

  res.status(200).json(new ApiResponse(200, "upload succesfull "));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
