import  asycHandler from "../utils/asyncHandler.js";

const registerUser = asycHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export default registerUser