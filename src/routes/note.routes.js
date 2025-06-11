import { Router } from "express";
import { validateProjectPermission, verifyJWT } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";
import { UserRolesEnum } from "../utils/constants.js";

const noteRouter = Router();

noteRouter.route("/create-note/:projectId").post(verifyJWT, validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createNote);

noteRouter.route("/update-note/:projectId").post(verifyJWT,validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateNote);

noteRouter.route("/get-notes/:projectId").get(verifyJWT, getNotes);

noteRouter.route("/get-note/:noteId").get(verifyJWT, getNoteById);

noteRouter.route("/delete-note/:projectId/:noteId").get(verifyJWT, validateProjectPermission([UserRolesEnum.MEMBER, UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteNote);

export default noteRouter;