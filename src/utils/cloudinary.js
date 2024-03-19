import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.REFRESH_TOKEN_EXPIRY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    //check if file path provided
    if (!localFilePath) return null;

    //if yes , upload
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file upload success", response.url);
    return response;
  } catch (error) {
    //remove locally saved temporary file as the upload operation go failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export {uploadOnCloudinary}