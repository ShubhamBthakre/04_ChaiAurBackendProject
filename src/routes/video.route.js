import { Router } from "express";
import { getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/").get(verifyJWT,getAllVideos)
router.route("/").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    }
  ]),
  publishAVideo
);
router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/:videoId/update").post(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/:videoId/change-publish-status").post(verifyJWT,togglePublishStatus)


export default router;
