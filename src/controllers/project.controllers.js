import { asyncHandler } from "../utils/async-handler.js"
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import User from "../models/user.model.js"
import { ProjectMember } from "../models/projectmember.model.js"
import { UserRolesEnum } from "../utils/constants.js"

const getProjects = asyncHandler(async (req, res) => {
    const currUserId = req.user._id;
    const memberProjects = await ProjectMember.find({user: currUserId}).populate("project");
    
    const projects = memberProjects.map(m => m.project);
    
    res.status(200).json(
        new ApiResponse(201, projects, "Projects fetched successfully")
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(401, "Project not found")
    }
    return res.status(201).json(
        new ApiResponse(201, project, "Project fetch suceessfull")
    )
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
    const member = await ProjectMember.create({
        user: req.user._id,
        project: newProject._id,
        role: UserRolesEnum.PROJECT_ADMIN
    })
    await newProject.save();
    return res.status(201).json(
        new ApiResponse(201, newProject, "Project created successfully")
    )
});

const updateProject = asyncHandler(async (req, res) => {
    const { projectName, projectDescription } = req.body;
    const { projectId } = req.params;
    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            name: projectName,
            description: projectDescription
        },
        {
            new: true
        }
    )
    if(!updatedProject){
        throw new ApiError(404, "Project not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if(!projectId){
        throw new ApiError(400, "Project Id required")
    }
    const deleteProject = await Project.findByIdAndDelete(projectId)
    if(!deleteProject){
        throw new ApiError(404, "Project not found")
    }
    return res.status(200).json(
        new ApiResponse("200", deleteProject, "Project deleted successfully")
    );
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, "Prokect not found")
    }

    if (project.createdBy.toString() !== req.user.userId) {
        throw new ApiError(403, "Only the project creator can add members");
    }

    const userToAdd = await User.findOne({ email })
    if(!userToAdd){
        throw new ApiError(404, `User with ${email} email not found`)
    }

    // Check if user is already a member
    const isAlreadyMember = await ProjectMember.findById(userToAdd._id)
    if (isAlreadyMember) {
        throw new ApiError(400, "User is already a member of this project.");
    }
    const newMember = await ProjectMember.create({
        user: userToAdd._id,
        project: projectId,
        role: role
    });
    await newMember.save();

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