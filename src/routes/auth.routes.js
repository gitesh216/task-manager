import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js"
import { 
    userRegistrationValidator, 
    userLoginValidator, 
    userVerificationEmailResendValidator,
    userForgotPasswordValidator,
    userResetForgottenPasswordValidator,
    userChangeCurrentPasswordValidator 
} from "../validators/index.js"

import { 
    registerUser, 
    verifyEmail, 
    loginUser, 
    logoutUser,
    resendVerificatonEmail,
    refreshAccessToken,
    resetPassword,
    changeCurrentPassword,
    getCurrentUser,
    forgotPasswordRequest
} from "../controllers/auth.controllers.js";

import { upload, isImageUploadedLocal } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), isImageUploadedLocal, userRegistrationValidator(), validate, registerUser);
// router.route("/register").post(userRegistrationValidator(), validate, registerUser)

router.route("/verify-email/:Verificationtoken").get(verifyEmail)

router.route("/login").post(userLoginValidator(), validate, loginUser)

router.route("/logout").get(isLoggedIn, logoutUser)

router.route("/resendverificationemail").post(userVerificationEmailResendValidator(), validate, resendVerificatonEmail)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/forgot-password").post(userForgotPasswordValidator(), validate,forgotPasswordRequest)

router.route("/reset-password/:reset-token").post(userResetForgottenPasswordValidator(), validate, resetPassword)

router.route("/change-password")
    .post(isLoggedIn,
        userChangeCurrentPasswordValidator(),
        validate,
        changeCurrentPassword
    )

router.route("/current-user").get(isLoggedIn, getCurrentUser)


export default router;
