import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  getLikedVideos,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/commentlike").post(verifyJWT , toggleCommentLike)
router.route("/videolike").post(verifyJWT , toggleVideoLike)
router.route("/tweetlike").post(verifyJWT , toggleTweetLike)
router.route("/LikedVideos").get(verifyJWT , getLikedVideos)

export default router;