import { Playlist } from "../models/playlist.model.js";
import mongooose from "mongoose"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

//---------------------CREATE A PLAYLIST-------------------------------------------------
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const user = req.user._id;

    if (!(name || description)) {
      throw new ApiError(422, "Didnt name and description  from the params");
    }

    const newPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: user
    });
    if(!newPlaylist){
        throw new ApiError(400 , "COULDNT CREATE NEW PLAYLIST ")
    }

    res.status(200).json( new ApiResponse(200 , "CREATED SUCCESSFULLY "))
})


//----------------------GET USER PLAYLIST--------------------------------------------------
const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const {id} = req.params
    if(!id){
        throw new ApiError(204 , "Didnt get id from request params")
    }

    const user = await User.findById(id)
    if(!user){
        throw new ApiError(404 , "USER NOT FOUND")
    }

    const playlist =  await Playlist.find({owner : id})
    if(!playlist){
        throw new ApiError(404 , "PLAYLIST DON'T EXIST ")
    }

    res.status(200).json(new ApiResponse(200 , "Fetched Successfully" , playlist))
})


//-------------------------GET PLAYLIST BY ID------------------------------------------------
const getPlaylistById = asyncHandler(async (req, res) => {
    const {id} = req.params
    if(!id){
        throw new ApiError(204 , " Didnt get id from params")
    }

    const playlist =  await Playlist.findById(id)
    if(!playlist){
        throw new ApiError(400 , "CANNOT FETCH PLAYLIST")
    }

    res.status(200).json(new ApiResponse(200 , "fetched successfully" , playlist))
})


//--------------------------ADD VIDEO TO PLAYLIST--------------------------------------------
const addVideoToPlaylist = asyncHandler(async (req, res) => {   
    const {playlistId, videoId} = req.body
    if(!(playlistId && videoId)){
        throw new ApiError(204 , " Didnt get ids from params")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
       throw new ApiError(404 , "PLAYLIST NOT FOUND ")
    }

    //add videos to videos array in playlist collection
    playlist.videos.push(videoId);

    const newVideo = await playlist.save();
    if(!newVideo){
        throw new ApiError(500 , "ERROR WHILE ADDING VIDEO ")
    }
    
    res.status(200).json(new ApiResponse(200 , "SUCCESSFULLY ADDED VIDEO "));
})

//---------------------------REMOVE VIDEO FROM PLAYLIST--------------------------------------
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.body
    if(!(playlistId || videoId)){
        throw new ApiError(204 , " Didnt get ids from params")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
       throw new ApiError(404 , "PLAYLIST NOT FOUND ")
    }

    //remove the video from the fetched playlist , then add that to db
    playlist.videos = playlist?.videos?.filter(v => v.toString() !== videoId);
    const newVideo = await playlist.save();

    if(!newVideo){
        throw new ApiError(500 , "ERROR WHILE DELETTING VIDEO ")
    }
    
    res.status(200).json(new ApiResponse(200 , "SUCCESSFULLY DELETED VIDEO "));
})

// ------------------------------DELETE PLAYLIST------------------------------------------------
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(204 , " Didnt get id from params")
    }

    const playlist =  await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(404 , "PLAYLIST DOES NOT EXIST ")
    }

    res.status(200).json(new ApiResponse(200 , "deleted successfully" , playlist))
})

//-------------------------------UPDATE PLAYLIST
const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId){
        throw new ApiError(204 , " Didnt get id from params")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404 , "COULDNT FIND THE PLAYLIST")
    }

    const updatedPl = await Playlist.findByIdAndUpdate({ name : name , description: description})

    if(!updatedPl){
        throw new ApiError(500 , "SOME ERROR  OCCURED WHILE UPDATING ")
    }

    res.status(200).ApiResponse(200 , "UPDATED SUCCESSFULLY ")
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}