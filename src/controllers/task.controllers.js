import { ProjectMember } from "../models/projectmember.model.js"
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import User from "../models/user.model.js"
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { SubTask } from "../models/subtask.model.js";

const getTasks = asyncHandler(async (req, res) => {
    // get all tasks
    const projectId = req.params?.projectId;
    if(!projectId){
        throw new ApiError(400, "Project Id is required")
    }
    const tasks = await Task.find({ 
        project: new mongoose.Types.ObjectId(projectId), 
    }).populate("assignedTo", "username email").populate("assignedBy", "username email");

    if(!tasks){
        throw new ApiError(500, "Error in fetching tasks")
    }

    return res.status(200).json(
        new ApiResponse(200, tasks, "Tasks fetched successfully")
    );
});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
    // get task by id
    const { taskId }  = req.params;
    if(!taskId){
        throw new ApiError(400, "Task Id is required")
    } 
    const task = await Task.findById(new mongoose.Types.ObjectId(taskId))
    .populate("assignedTo", "username email")
    .populate("assignedBy", "username email");

    if(!task){
        throw new ApiError(500, "Error in fetching task")
    }
    return res.status(200).json(
        new ApiResponse(200, task, "Task fetched successfully")
    );
});

// create task
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;
    if(!title || !description || !assignedTo || !status || !projectId){
        throw new ApiError(400, "All task details required")
    }
    const assignedUser = await User.findById(new mongoose.Types.ObjectId(assignedTo))
    if(!assignedUser){
        throw new ApiError(400, "Assigned user not found")
    }
    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo: assignedUser._id,
        assignedBy: req.user._id,
        status
    });
    if(!task){
        throw new ApiError(501, "Error in creating new task")
    }
    return res.status(200).json(
        new ApiResponse(200, task, "Task created successfully")
    )
});

// update task
const updateTask = asyncHandler(async (req, res) => {
    // update task
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;
    if(!title || !description || !assignedTo || !status || !projectId){
        throw new ApiError(400, "All task details required")
    }
    const assignedUser = await User.findById(new mongoose.Types.ObjectId(assignedTo))
    if(!assignedUser){
        throw new ApiError(400, "Assigned user not found")
    }
    const task = await Task.updateOne({
        title,
        description,
        project: projectId,
        assignedTo: assignedUser._id,
        assignedBy: req.user._id,
        status,
        new: true
    });
    if(!task){
        throw new ApiError(501, "Error in updating task")
    }
    return res.status(200).json(
        new ApiResponse(200, task, "Task updated successfully")
    )
});

// delete task
const deleteTask = asyncHandler(async (req, res) => {
    // delete task
    const { taskId } = req.params;
    if(!taskId){
        throw new ApiError(400, "Task Id is required")
    }
    const task = await Task.findByIdAndDelete(new mongoose.Types.ObjectId(taskId));
    if(!task){
        throw new ApiError(501, "Error in deleting task")
    }
    return res.status(200).json(
        new ApiResponse(200, task, "Task deleted successfully")
    );
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
    // create subtask
    const { title, isCompleted } = req.body;
    const { taskId } = req.params;
    if(!title || !isCompleted || !taskId){
        throw new ApiError(400, "All subtask details required")
    }
    const subtask = await SubTask.create({
        title,
        task: taskId,
        isCompleted,
        createdBy: req.user._id
    });

    if(!subtask){
        throw new ApiError(501, "Error in creating new subtask")
    }
    return res.status(200).json(
        new ApiResponse(200, subtask, "Subtask created successfully")
    )
});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
    // update subtask
    const { title, isCompleted } = req.body;
    const { taskId } = req.params;
    if(!title || !isCompleted || !taskId){
        throw new ApiError(400, "All subtask details required")
    }
    const subtask = await SubTask.updateOne({
        title,
        task: taskId,
        isCompleted,
        createdBy: req.user._id,
        new: true
    });

    if(!subtask){
        throw new ApiError(501, "Error in updating subtask")
    }
    return res.status(200).json(
        new ApiResponse(200, subtask, "Subtask updated successfully")
    );
});

// delete subtask
const deleteSubTask = async (req, res) => {
    // delete subtask
    const { subtaskId } = req.params;
    if(!subtaskId){
        throw new ApiError(400, "Subtask Id is required")
    }
    const subtask = await SubTask.findByIdAndDelete(new mongoose.Types.ObjectId(subtaskId));
    if(!subtask){
        throw new ApiError(501, "Error in deleting subtask")
    }
    return res.status(200).json(
        new ApiResponse(200, subtask, "Subtask deleted successfully")
    );
};

export {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
};
