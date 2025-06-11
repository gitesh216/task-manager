import Router from "express";
import { 
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
 } from "../controllers/task.controllers.js";
import { isLoggedIn, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.route("/create-task/:projectId").post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), createTask);

router.route("/updateTask/:taskId").post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), updateTask);

router.route("/create-subtask/:taskId").post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), createSubTask);

router.route("/update-subtask/:subtaskId").post(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), updateSubTask);

router.route("/get-tasks/:projectId").get(isLoggedIn, getTasks);

router.route("/get-task/:taskId").get(isLoggedIn, getTaskById);

router.route("/delete-task/:taskId").get(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), deleteTask);

router.route("/delete-subtask/:subtaskId").get(isLoggedIn, validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.PROJECT_ADMIN]), deleteSubTask);

export default router;

