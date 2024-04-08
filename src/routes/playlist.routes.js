import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPl").post(verifyJWT , createPlaylist)
router.route("/addVideo").post(verifyJWT , addVideoToPlaylist)
router.route("/deletePl").delete(verifyJWT , deletePlaylist)
router.route("/getPlById/:id").get(getPlaylistById)
router.route("/getUserPl/:id").get(verifyJWT , getUserPlaylists)
router.route("/removeVideo").delete(verifyJWT , removeVideoFromPlaylist)
router.route("/updatePl").patch(verifyJWT , updatePlaylist)

export default router 