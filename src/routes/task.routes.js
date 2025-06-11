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

export default router;

