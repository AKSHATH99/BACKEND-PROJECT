import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


//-------FETCHING COMMENTS------------------------------------------------
const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { id } = req.params;
  // const {page = 1, limit = 10} = req.query


  const comments = await Comment.find({ video: id });

  if (!comments) {
    throw new ApiError(404, "NO COMMENTS YET");
  }
  
  res
    .status(200)
    .json(new ApiResponse(400, "comments fetched successfully ", comments));
});


//-------------------ADDING COMMENT-------------------------------------------
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { comment, videoId } = req.body;

  const video = Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "VIDEO DOES NOT EXIST ");
  }

  const newComment = new Comment({
    content: comment,
    video: videoId,
    owner: req.user._id,
  });

  // Save the tweet
  await newComment.save();

  if (req) {
    console.log("REQUEST GOT");
  }

  res.status(200).json(new ApiResponse(200, "COMMENT ADDED SUCCESSFULLY "));
});


//-------------------UPDATING  COMMENT-------------------------------------------
const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { newComment, commentId } = req.body;

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content: newComment,
  });

  if (!updatedComment) {
    throw new ApiError(500, "comment couldnt be updated ");
  }
  res.status(400).json(new ApiResponse(200, "COMMENT UPDATED SUCCESSFULLY "));
});


//-------------------DELETING  COMMENT-------------------------------------------
const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { id } = req.params;

  const deletedComment = await Comment.findByIdAndDelete(id);

  if (!deletedComment) {
    throw new ApiError(500, "comment couldnt be deleted ");
  }
  res.status(400).json(new ApiResponse(200, "COMMENT DELETED SUCCESSFULLY "));
});

export { getVideoComments, addComment, updateComment, deleteComment };
