import { ProjectMember } from "../models/projectmember.model.js"
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import User from "../models/user.model.js"
import { Task } from "../models/task.model.js";

const getTasks = async (req, res) => {
    // get all tasks
};

// get task by id
const getTaskById = async (req, res) => {
    
};

// create task
const createTask = async (req, res) => {
    const { title, description, assignedTo, status } = req.body;
    const { projectId } = req.params;
    if(!title || !description || !assignedTo || status || projectId){
        throw new ApiError(400, "All task details required")
    }
    const assignedUser = await User.findById(assignedTo)
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
};

// update task
const updateTask = async (req, res) => {
    // update task
};

// delete task
const deleteTask = async (req, res) => {
    // delete task
};

// create subtask
const createSubTask = async (req, res) => {
    // create subtask
};

// update subtask
const updateSubTask = async (req, res) => {
    // update subtask
};

// delete subtask
const deleteSubTask = async (req, res) => {
    // delete subtask
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
