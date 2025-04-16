import { asyncHandler } from "../utils/async-handler.js"
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js"

const getProjects = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
    //output:
    // project names
    // description
    // count of members
    // when created
});

const getProjectById = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;

});

const createProject = asyncHandler(async (req, res) => {
    const { projectName, projectDescription } = req.body;
    
    const existingProject = await Project.findOne({name: projectName})
    if(existingProject){
        throw new ApiError(409, "Project name already exists")
    } 
    const newProject = await Project.create({
        name: projectName,
        description: projectDescription,
        createdBy: req.user._id
    })
    newProject.members.push({
        user: req.user._id,
        role: "admin"
    })
    await newProject.save();
    return res.status(201).json(
        new ApiResponse(201, newProject, "Project created successfully")
    )
});

const updateProject = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
    
});

const deleteProject = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
 
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const userToAdd = await User.findOne({email})
    if(!userToAdd){
        throw new ApiError(404, `User with ${email} email not found`)
    }

    const project = await Project.find({ createdBy: req.user._id });
    if(!project){
        throw new ApiError(404, "Prokect not found")
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
        (member) => member.user.toString() === userToAdd._id.toString()
    );
    if (isAlreadyMember) {
        throw new ApiError(400, "User is already a member of this project.");
    }
    project.members.push({
        user: userToAdd._id,
        role: role
    })
    await project.save();

    return res
      .status(200)
      .json(new ApiResponse(200, project, "Member added to project successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
 
});

const updateProjectMembers = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
 
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
    
});

const deleteMember = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;
 
}); 


export {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers,
    updateProjectMembers,
    updateMemberRole,
    deleteMember
}