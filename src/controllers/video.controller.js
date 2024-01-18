import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  // Constructing the query object based on parameters
  const queryObject = {};

  if (query) {
    // Case-insensitive search for the video title
    queryObject.title = { $regex: new RegExp(query, "i") };
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  //get details from req.body
  //validate data
  //get vedio file from multer middleware
  //check if localpath exit
  //if exist than upload on cloudinary
  //check if uploaded successfully
  //add in video object in db
  //return res
  const { title, description } = req.body;

  
    if (!title || !description) {
      throw new ApiError(400, "All fields are required");
    }
  
    const videoLocalPath = req.files?.video[0]?.path;
  
    let thumbnailLocalPath;
  
    if (req.files && req.files.thumbnail.length > 0) {
      thumbnailLocalPath = req.files.thumbnail[0].path;
    }
  
    if (!videoLocalPath) {
      throw new ApiError(400, "videoFile does not exit");
    }
  
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "thumbnail does not exit");
    }
  
    const videoResponse = await uploadOnCloudinary(videoLocalPath);
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);
  
    if (!videoResponse || !thumbnailResponse) {
      throw new ApiError(
        400,
        "Something went wrong while uploading video and thumbnail"
      );
    }
  
    const videoFile = {
      publicId: videoResponse.public_id,
      url: videoResponse.url,
    };
  
    const thumbnailFile = {
      publicId: thumbnailResponse.public_id,
      url: thumbnailResponse.url,
    };
  
    const video = await Video.create({
      videoFile: videoFile,
      thumbnail: thumbnailFile,
      title: title,
      description: description,
      duration: videoFile.duration,
      owner: req.user?._id,
    });
  
    if (!video) {
      throw new ApiError(
        401,
        "Something went wrong while adding video to databse"
      );
    }
 
  return res
    .status(200)
    .json(new ApiResponse(201,video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
