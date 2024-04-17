import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// -------------------------------GET ALL VIDEOS------------------------------------------------------
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Constructing the filter object based on query parameters
  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } }, // For  Case-insensitive search
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    filter.owner = userId;
  }

  // Constructing the sort object based on sortBy and sortType
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    // Default sorting by createdAt in descending order
    sort.createdAt = -1;
  }

  try {
    const videos = await Video.aggregatePaginate([], {
      // Using aggregatePaginate for pagination
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      customLabels: { docs: "videos" }, // Renaming the response field 'docs' to 'videos'
    });

    res.status(200).json(new ApiResponse(200, "success", videos));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiResponse(500, "error", null, "Internal Server Error"));
  }
});


// -------------------------------PUSBLISH  VIDEOS------------------------------------------------------
const publishAVideo = asyncHandler(async (req, res) => {

  const { title, description } = req.body;
  if(!(title || description) ){
    throw new ApiError(422 , "DESCRIPTION OR TITLE IS MISSING ")
  }

  //Fetch files from req
  const videoLocalPath = req.files.video[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  if (!videoLocalPath) {
    throw new ApiError(422, "VIDEO FILE IS REQUIRED");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(422, "THUMBNAIL FILE IS REQUIRED");
  }

  //Upload to cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(
      500,
      "SOMETHING WENT WRONG WHILE UPLOADING VIDEO  TO CLOUDINARY ",
    );
  }
  if (!thumbnail) {
    throw new ApiError(
      500,
      "SOMETHING WENT WRONG WHILE UPLOADING TO THUMBNAIL CLOUNDINARY ",
    );
  }

  //Insert into db
  const dbVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title: title,
    description: description,
    duration: video.duration,
    owner: req.user._id,
  });

  const uploadedVideo = await Video.findById(dbVideo._id);
  if (!uploadedVideo) {
    throw new ApiError(500, "SOMETHING WRONG WHILE UPLAODING VIDEO TO DB ");
  }

  res.status(200).json(new ApiResponse(200, "upload succesfull "));
});



// -------------------------------GET  VIDEOS BY ID ------------------------------------------------------
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if(!videoId){
    throw new ApiError(422 , "Video ID not recieved from params ")
  }  

  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404 , "VIDEO NOT FOUND")
  }

  res.status(200).json(new ApiResponse(200, "fetched video successfully ", video));
  //TODO: get video by id
});


// -------------------------------UPDATE VIDEOS------------------------------------------------------
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const user = req.user;

  if(!(title || description)){
    throw new ApiError(422 , "TITLE AND DESCRIPTION REQUIRED ")
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "VIDEO NOT FOUND ");
  }

  if (!user._id.equals(video.owner)) {
    throw new ApiError(400, "YOU CANNOT PERFORM THIS OPERATION ");
  }

  //Access the file url from req
  const videoLocalPath = req.files.video[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  //Upload on cloudinary 
  const cloudvideo = await uploadOnCloudinary(videoLocalPath);
  const cloudThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!cloudvideo) {
    throw new ApiError(
      500,
      "SOME ERROR OCCURED WHILE UPLAODING TO CLOUDNARY - VIDEO",
    );
  }
  if (!cloudThumbnail) {
    throw new ApiError(
      500,
      "SOME ERROR OCCURED WHILE UPLAODING TO CLOUDNARY - thumbnail",
    );
  }

  video.title = title;
  video.description = description;
  video.videoFile = cloudvideo.url; 
  video.thumbnail = cloudThumbnail.url;
  video.duration = video.duration;
  await video.save();

  res.status(200).json(new ApiResponse(200, "updated video successfully "));
  //TODO: update video details like title, description, thumbnail
});



// -------------------------------DELETE  VIDEOS------------------------------------------------------
const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  const user = req.user;
  // console.log(videoId)

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, " Video Not found");
  }
  //checks if the real owner is trying to delete video or not
  if (!user._id.equals(video.owner)) {
    throw new ApiError(401 , "You cannot perform this operation")
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if(!deletedVideo){
    throw new ApiError(500 , "Something went wrong while deleting the video")
  }

  res.status(200).json(new ApiResponse(200, "deleted video successfully "));
});



// -------------------------------TOGGLE PUBLISH STATUS ------------------------------------------------------
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "VIDEO NOT FOUND ");
  }

  const toggledStatus = await Video.findByIdAndUpdate(videoId, {
    isPublished: !video.isPublished,
  });

  if (!toggledStatus) {
    throw new ApiError(500, "COULDNT TOGGLEE STATUS");
  }
  res.status(200).json(new ApiResponse(200, "toggled successfully "));
});



export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
