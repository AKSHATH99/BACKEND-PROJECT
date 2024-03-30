import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//generates refresh and access tokens using the user id
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log(accessToken);
    // console.log("refreshToken :", refreshToken);
    user.refreshToken = refreshToken;
    //skip validation
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

//register user
const registerUser = asyncHandler(async (req, res) => {
  //access req.body
  const { fullName, email, username, password } = req.body;
  // console.log("email : ", email);

  //check each field seperatly
  // if (fullName === "") {
  //   throw new ApiError(400, "FULL NAME IS REQUIRED");
  // }

  // Check for all  edge cases -> does request contain name , username password and email
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "ALL FIELDS ARE REQUIRED ");
  }

  //Find if the user with those credentials already exist or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "USER WITH EMAIL / USERNAME ALREDY EXIST ");
  }

  //upload images....
  console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "AVATAR FILE IS REQUIRED");
  }

  //after accessing  the local path given inside the req body , pass it as paramatere into cloudinary function to upload
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(avatarLocalPath);
  //if success , it will return a cloudinary url

  if (!avatar) {
    throw new ApiError(400, "AVATAR FILE IS REQUIRED");
  }

  //if all good , update it into the db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //store details of the new user into a variable (excluding password and refreshtoken)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "SOMETHING WROING WHILE REGISTRATION");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //1. find user from db
  //2. passsword verify
  //3. token creation
  // 4. send response
  const { email, username, password } = req.body;


  if (!username || !email) {
    throw new ApiError(400, "username or password is required");
  }

  //find user from db
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //IF USER NOT FOUND
  if (!user) {
    throw new ApiError(404, "USER DOES NOT EXIST ");
  }

  //password validation using bcrypt
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "CREDENTIALS INCORRECT ");
  }

  //generate tokens , pass in user id for that
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  //send response including details of token and user object
  const loggedInUSer = await User.findById(user._id).select("username email");

  const options = {
    httpOnly: true,
    secure: true,
  };



  return res
    .status(200)
    .cookie("accesToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUSer,
          accessToken,
          refreshToken,
        },
        "LOGIN SUCCESSFULL ",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //empty the refeshToken field
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out "));
});
//now if user have to login , he need to enter the credentials again as the refreshtoken is not in db

const refreshAccessToken = asyncHandler(async (req, res) => {
  //access refreshtoken from the req body
  const incomingRefreshToken =
    req?.cookies.refreshToken || req?.body.refreshToken;
  
    // console.log(incomingRefreshToken)

  if (!incomingRefreshToken) {
    throw new ApiError(401, "UNAUTHORISED REQUEST");
  }

  try {
    console.log(incomingRefreshToken)
    //verify refreshtoken using jwt
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      // process.env.ACCESS_TOKEN_SECRET,
      "012345678901"
    );

    console.log("decodedToken")
    const user = await User.findById(decodedToken?._id);
    console.log("user")

    if (!user) {
      throw new ApiError(401, "INVALID REFRESH TOKEN ");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "REFRESH TOKEN IS EXPIRED OR USED ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accesstoken", accessToken, options)
      .cookie("refreshtoken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshtoken: newRefreshToken },
          "ACCESS TOKEN REFRESHED",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token ");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //use id from auth middleware and find user in db 
  const user = await User.findById(req.user?._id);

  //check password is correct using bcrypt
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "INVALID OLD PASSWORD");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  //this will the pre function defined in the models , since the password is being  changed
  //that will automaticlly hash new password

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "PASSWORD CHANGED SUCCESSFULLY "));
});

//User can get curent user data only if he has logged in
//Obviously the user object is  in the req.body since the
// auth middleware is inserting it from the server. So just acccess it and print it down
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "FETCHED SUCCESSFULLY"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "ALL FIELDS ARE REQUIRED");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName:fullName,
        email:email,
      },
    },
    //this will return updated data , user variable will store the new data then
    { new: true },
  ).select("-password"); // remove password from returned obj of data

  return res
    .status(200)
    .json(new ApiResponse(200, "ACOUNT DETAILS UPDATED SUCCESSFULLY"));
});

const updateUserAvater = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverimage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  //user name is passed as params from frontend
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "usrname is missing ");
  }

  //PIPELINES
  const channel = await User.aggregate([
    {
      //find usr
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      //find the user's subscribers
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      //find how manny channel user has subscribed to
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      //based on filtered data got through above pipelines , add new fields inside user document
      //subscriber count and subscribed to count also , issubscribed
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            //go to subscribers object and find if req.user is in the  subscriber field
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    //defines which all  fields of the result to display
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully "),
    );
  // console.log(channel);
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      //retrive user
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      //retrive user's watchHistory
      $lookup: {
        from: "videos",
        foreignField: _id,
        localField: watchHistory,
        as: "watchHistory",
        pipeline: [
          //write subpipelines to get owner details which will come from user collecttion
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          //use first element of the output array and add it to new field owner or
          //rewrite existing owner field
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched succesfully",
      ),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvater,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
