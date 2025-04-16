import { Router } from "express";
import {
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
}from "../controllers/project.controllers.js";

import { isLoggedIn } from "../middlewares/auth.middleware.js"

const router = Router();


router.route("/get-projects").get(getProjects);

router.route("/create").post(isLoggedIn, createProject);


export default router;