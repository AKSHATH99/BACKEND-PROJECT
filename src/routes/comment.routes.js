import { Router } from "express";
import { getVideoComments, addComment , deleteComment , updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addComment").post(verifyJWT, addComment)
router.route("/updateComment").patch(verifyJWT, updateComment)
router.route("/deleteComment/:id").delete(verifyJWT, deleteComment)
router.route("/getVideoComments/:id").get(verifyJWT, getVideoComments)

export default router                             