import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //get require data from req.body
  //validate data
  //

  const { name="Web Development", description="This is the playlist for web development" } = req.body;

  console.log("name", name);
  console.log("description", description);

  if (!name) {
    throw new ApiError(400, "name for playlist is require");
  }

  if (!description) {
    throw new ApiError(400, "description is required");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(400, "something went wrong while creating playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    // const userId = req.user?._id
    const {userId}=req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"UserId is required")
    }

    //approach-1
    // const playlist= await Playlist.aggregate([{
    //     $match:{
    //         owner:userId
    //     }
    // }])

    //approach-2

    const playlist=await Playlist.find({owner:userId})

    if (!playlist){
        throw new ApiError(400,"Playlist does not exit")
    }

    res.status(200).json(new ApiResponse(200,playlist,"playlist fetch successfully"))

   
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    console.log(playlistId)

    const playlist=await Playlist.findById(playlistId)

    if (!playlist){
        throw new ApiError(400,"Playlist does not exit")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"playlist fetch successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    console.log(playlistId,videoId)

    if (!playlistId){
        throw new ApiError(400,"Playlist id is required")
    }

    if (!videoId){
        throw new ApiError(400,"video id is required")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"playList does not exit")
    }

    console.log(playlist)
    console.log("videos",playlist.videos)
    console.log("type of VideoId",typeof videoId)
    playlist.videos.push(videoId)


    const result=await playlist.save({ validateBeforeSave: false })

    if(!result){
        throw new ApiError(500,"Something went wrong while adding video to playlist")
    }

    res.send(200).json( new ApiResponse(201,result,"Video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})
export { createPlaylist ,getUserPlaylists,getPlaylistById,addVideoToPlaylist};



