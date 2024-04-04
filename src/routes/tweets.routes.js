import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/createTweet").post(createTweet)
router.route("/getTweets").get(getUserTweets)
router.route("/deleteTweets/:id").delete(deleteTweet)
router.route("/updateTweet/:id").patch(updateTweet)

export default router;