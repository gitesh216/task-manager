import mongoose from "mongoose";
import { ProjectNote } from "../models/note.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

// boilderplate code
const getNotes = asyncHandler(async (req, res) => {
    // get all notes
    const projectId = req.params?.projectId;
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(400, "User Id is required");
    }
    if(!projectId){
        throw new ApiError(400, "Project Id is required");
    }

    const project = await Project.findById(new mongoose.Types.ObjectId(projectId));
    if(!project){
        throw new ApiError(404, "Project not found");
    }

    const notes = await ProjectNote.find({ 
        project: new mongoose.Types.ObjectId(projectId), 
    }).populate("createdBy", "username email");

    if(!notes){
        throw new ApiError(500, "Error in fetching notes");
    }

    return res.status(200).json(
        new ApiResponse(200, notes, "Notes fetched successfully")
    );
});

const getNoteById = asyncHandler(async (req, res) => {
    // get note by id
    const noteId = req.params?.noteId;
    const note = await ProjectNote.findById(
        new mongoose.Types.ObjectId(noteId)
        ).populate("createdBy", "username email");

    if(!note){
        throw new ApiError(500, "Error in fetching note");
    }
    return res.status(200).json(
        new ApiResponse(200, note, "Note fetched successfully")
    );
});

const createNote = asyncHandler(async (req, res) => {
    // create note
    const projectId = req.params?.projectId;
    const noteContent = req.body?.noteContent;
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "User Id is required");
    }
    if(!projectId){
        throw new ApiError(400, "Project Id is required");
    }
    if(!noteContent){
        throw new ApiError(400, "Note content is required");
    }
    const project = await Project.findById(new mongoose.Types.ObjectId(projectId));
    if(!project){
        throw new ApiError(404, "Project not found");
    }

    const note = await ProjectNote.create({ 
        project: projectId, 
        createdBy: userId, 
        content: noteContent 
    });

    const newnote = await ProjectNote.findById(note._id).populate('createdBy', 'username email');

    if(!newnote){
        throw new ApiError(500, "Error in creating note");
    }

    return res.status(200).json(
        new ApiResponse(200, newnote, "Note created successfully")
    );
});

const updateNote = asyncHandler(async (req, res) => {
    // update note
    const projectId = req.params?.projectId;
    const noteContent = req.body?.noteContent;
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "User Id is required");
    }
    if(!projectId){
        throw new ApiError(400, "Project Id is required");
    }
    if(!noteContent){
        throw new ApiError(400, "Note content is required");
    }

    const note = await ProjectNote.updateOne({ 
        project: projectId, 
        createdBy: userId, 
        content: noteContent,
        new: true
    }).populate("createdBy", "username email");

    if(!note){
        throw new ApiError(500, "Error in creating note");
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note created successfully")
    );
});

const deleteNote = asyncHandler(async (req, res) => {
    // delete note
    const noteId = req.params?.noteId;
    const note = await ProjectNote.findByIdAndDelete(noteId);

    if(!note){
        throw new ApiError(500, "Error in deleting note");
    }
    return res.status(200).json(
        new ApiResponse(200, note, "Note deleted successfully")
    );
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
