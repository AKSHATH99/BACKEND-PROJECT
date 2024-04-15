import { Router } from "express";

import { toggleSubscription , getSubscribedChannels , getUserChannelSubscribers } from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggleSubscription").post(verifyJWT, toggleSubscription);
router.route("/getSubscribedChannels").get(getSubscribedChannels)
router.route("/getSubscribers").get(verifyJWT , getUserChannelSubscribers)
router.route("/create").get(verifyJWT , getUserChannelSubscribers)

export default router;
