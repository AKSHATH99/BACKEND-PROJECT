import { Router } from "express";

import { toggleSubscription , getSubscribedChannels , getUserChannelSubscribers } from "../controllers/subscription.controller";

const router = Router();

router.route("/toggleSubscription").post(toggleSubscription);
router.route("/getSubscribedChannels").get(getSubscribedChannels)
router.route("/getSubscribers").get(getUserChannelSubscribers)

export default router;
