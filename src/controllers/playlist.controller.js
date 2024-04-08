import { Playlist } from "../models/playlist.model.js";
import mongooose from "mongoose"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const user = req.user._id;

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


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {id} = req.params
    //TODO: get user playlists

    const user = await User.findById(id)
    if(!user){
        throw new ApiError(200 , "USER NOT FOUND")
    }

    const playlist =  await Playlist.find({owner : id})

    if(!playlist){
        throw new ApiError(400 , "CANNOT FETCH PLAYLIST")
    }

    res.status(200).json(new ApiResponse(200 , "fetched successfully" , playlist))
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {id} = req.params
    //TODO: get playlist by id

    const playlist =  await Playlist.findById(id)

    if(!playlist){
        throw new ApiError(400 , "CANNOT FETCH PLAYLIST")
    }

    res.status(200).json(new ApiResponse(200 , "fetched successfully" , playlist))
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {   
    const {playlistId, videoId} = req.body


    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
       throw new ApiError(400 , "PLAYLIST NOT FOUND ")
    }

    playlist.videos.push(videoId);
    const newVideo = await playlist.save();

    if(!newVideo){
        throw new ApiError(400 , "ERROR WHILE ADDING VIDEO ")
    }
    
    res.status(200).json(new ApiResponse(200 , "SUCCESSFULLY ADDED VIDEO "));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const {playlistId, videoId} = req.body

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
       throw new ApiError(400 , "PLAYLIST NOT FOUND ")
    }

    //remove the video from the fetched playlist , then add that to db
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    const newVideo = await playlist.save();

    if(!newVideo){
        throw new ApiError(400 , "ERROR WHILE DELETTING VIDEO ")
    }
    
    res.status(200).json(new ApiResponse(200 , "SUCCESSFULLY DELETED VIDEO "));

    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    const playlist =  await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400 , "PLAYLIST DOES NOT EXIST ")
    }

    res.status(200).json(new ApiResponse(200 , "deleted successfully" , playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400 , "COULDNT FIND THE PLAYLIST")
    }

    const updatedPl = await Playlist.findByIdAndUpdate({ name : name , description: description})

    if(!updatedPl){
        throw new ApiError(400 , "SOMETHIGN OCCURED WHILE UPDATING ")
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