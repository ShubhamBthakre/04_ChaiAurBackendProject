import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteCloudinaryOldImage,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  //TODO: get all videos based on query, sort, pagination

  //get query data from req.query
  //write pagination pipeline
  //sent response

  const aggregatePipeline = [];

  if (query) {
    aggregatePipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }

  if (userId) {
    aggregatePipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  if (sortBy && sortType) {
    aggregatePipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    aggregatePipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  const videos = await Video.aggregate(aggregatePipeline);

  if (!videos) {
    throw new ApiError(400, "No vedios found");
  }

  const result = await Video.aggregatePaginate(videos, "");
  console.log("result",result)

  if (!result) {
    throw new ApiError(501, "something went wrong while fetching videos");
  }

  res.status(200).json(new ApiResponse(200, result, "Videos fetch successfully"));
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
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //Get videoId from url
  //validate videoId
  //check is video available by VideoId in database
  //if available send the response
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is wrong");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(
      400,
      "The video your are trying to fetch is not available"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(201, video, "video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;
  //get videoId from url
  //validate videoId
  //get Data from body
  //validate data
  //check if is there video in Database with userId
  //if video is there then update details otherwise return errro
  //delete old thumbnail image from cloudinary and upload new one
  //send response

  if (!videoId) {
    throw new ApiError(201, "VideoId is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(
      201,
      "The video you are trying to access is not available"
    );
  }

  console.log(req.file);

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  await deleteCloudinaryOldImage(video.thumbnail.url);

  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  video.title = title;
  video.description = description;
  video.thumbnail.url = newThumbnail.url;
  video.thumbnail.publicId = newThumbnail.public_id;

  const result = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  //Get videoId by params
  //check video in database by videoId
  //if video is not there then throw error
  //delete thumbnail and vedio from cloudinary
  //delete video details from database
  //sent response

  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }

  //find video in database
  const video = await video.findById(videoId);

  //deleting from cloudinary
  await deleteCloudinaryOldImage(video.videoFile.url);
  await deleteCloudinaryOldImage(video.thumbnail.url);

  //deleting from database
  const result = await video.deleteOne({ _id: videoId });
  return res
    .status(200)
    .json(new ApiResponse(201, result, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const video = await Video.findById(videoId);

    if (video.isPublished){
      video.isPublished=false
    }else{
      video.isPublished=true
    }

  const result = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(201, result, "Publish status toggle successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
