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


router.route("/get-projects").get(isLoggedIn, getProjects)

router.route("/create").post(isLoggedIn, createProject)

router.route("/add-member").post(isLoggedIn, addMemberToProject)

router.route("/get-byId/:projectId").get(isLoggedIn, getProjectById)

router.route("/update/:projectId").post(isLoggedIn, updateProject)

router.route("/delete/:projectId").get(isLoggedIn, deleteProject)

router.route("/add-member/:projectId").post(isLoggedIn, addMemberToProject)

router.route("/get-members/:projectId").post(isLoggedIn, getProjectMembers)

router.route("/update-role/:projectId").post(isLoggedIn, updateMemberRole)

router.route("/delete-member/:projectId").post(isLoggedIn, deleteMember)

export default router;