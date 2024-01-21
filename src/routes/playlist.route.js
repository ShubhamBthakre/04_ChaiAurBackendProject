import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist ,getPlaylistById, getUserPlaylists} from "../controllers/playlists.controller.js";


const router=Router();

router.route("/").post(verifyJWT,createPlaylist);
router.route("/:playlistId").get(verifyJWT,getPlaylistById)
router.route("/user/:userId").get(verifyJWT,getUserPlaylists)
router.route("/:playlistId/:videoId").post(verifyJWT,addVideoToPlaylist)

export default router;
