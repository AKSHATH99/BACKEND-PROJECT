import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

//generates refresh and access tokens using the user id
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log(accessToken);
    // console.log("refreshToken :", refreshToken);
    user.refreshToken = refreshToken;
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
  console.log("email : ", email);

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
  console.log(email);

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

  console.log("just before return : ", accessToken);
  console.log("just before return : ", refreshToken);

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

  if (!incomingRefreshToken) {
    throw new ApiError(401, "UNAUTHORISED REQUEST");
  }

  try {
    //verify refreshtoken using jwt
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
