import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js"
import { userRegistrationValidator, userLoginValidator } from "../validators/index.js"
import { registerUser, isImageUploadedLocal, verifyEmail, loginUser, logoutUser } from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/register").post(upload.single("avatar"), userRegistrationValidator(), validate, registerUser);
router.route("/register").post(userRegistrationValidator(), validate, registerUser);

router.route("/verify/:token").get(verifyEmail);

router.route("/login").post(userLoginValidator(), validate, loginUser);

router.route("/logout").get(isLoggedIn ,logoutUser);


export default router;
