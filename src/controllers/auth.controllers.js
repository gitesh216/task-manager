import { asyncHandler } from "../utils/async-handler.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendMail, emailVerificationMailGenContent } from "../utils/mail.js";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/api-response.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { log } from "console";

dotenv.config();

const isImageUploadedLocal = asyncHandler(async (req, res) => {
    try{
        console.log(req.file)
        res.status(200).json(new ApiResponse(200, req.file, "Avatar file uploaded sucessfully"))
    }
    catch(error){
        console.log(error);
        throw new ApiError(401, "Avatar file not uploaded", error);
    }
})

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullname } = req.body;
    console.log(email);
    
    const existingUser = User.findOne({ email });
    if (!existingUser) {
        console.log(existingUser.email);
        throw new ApiError(409,"User with email or username already exists")
    }
    // const avatarImageLocalPath = req.file?.path
    // if(!avatarImageLocalPath){
    //     throw new ApiError(400,"Avatar file is required")
    // }
    // const avatar = uploadOnCloudinary(avatarImageLocalPath, "avatars");

    // if(!avatar){
    //     throw new ApiError(400,"Error while uploading image on Cloudinary");
    // }

    const newUser = await User.create({
        username,
        email,
        password,
        fullname,
        // avatar: {
        //     url: avatar.url,
        //     localPath: avatarImageLocalPath
        // }
    });

    if (!newUser) {
        throw new ApiError(400,"User not registered");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = newUser.generateTemporaryToken();
    newUser.emailVerificationToken = unHashedToken;
    newUser.emailVerificationExpiry = tokenExpiry;

    await newUser.save();

    // Send email

    const emailBody = emailVerificationMailGenContent(
        username,
        `${process.env.BASE_URL}/api/v1/users/verify/${unHashedToken}`,
    );

    const options = {
        email: email,
        subject: "User email Verification",
        mailGenContent: emailBody,
    };

    await sendMail(options);

    const createdUser = await User.findById(newUser._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry"
    )
    console.log(createdUser);
    
    return res.status(201).json(
        new ApiResponse(200, {email: createdUser.email}, "User Registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Invalid user or password"));
    }
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Invalid user or password"));
    }

    if (!user.isEmailVerified) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "User email not verified"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    res.cookie("token", accessToken, {
        httpOnly: true,
        sameSite: "strict", // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
    })
        
    return res.status(200)
        .json(
            new ApiResponse(200, 
                {
                    email, 
                    username: user.username,
                    fullname: user.fullname
                }, 
                "Login successful"),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const { email, username } = req.user;
    const user = await User.findOne({ email });
    user.refreshToken = undefined;
    await user.save();

    res.cookie("token", "", {
        maxAge: 1,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    console.log(token);
    
    if (!token) {
        throw new ApiError(400, "Invalid verification token", error);
    }

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, user.email, "Email verification successful"),
        );
});

const resendVerificatonEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = User.findOne({ email });
    if (!user) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "User not registered"));
    }
    if (user.isEmailVerified) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    user.email,
                    "User is verified, please login",
                ),
            );
    }
    const token = crypto.randomBytes(32).toString("hex");
    newUser.emailVerificationToken = token;
    newUser.emailVerificationExpiry = Date.now() + 10 * 60 * 1000;

    await newUser.save();

    // Send email

    const emailBody = emailVerificationMailGenContent(
        username,
        `${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    );

    const options = {
        email: email,
        subject: "User email Verification",
        mailGenContent: emailBody,
    };

    await sendMail(options);

    return res.status(201).json(new ApiResponse(201, null, "User registered successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    // forgotPasswordToken: {
    //     type: String,
    //   },
    //   forgotPasswordExpiry: {
    //     type: Date,
    //   },
    const { email } = req.body;
    const user = User.findOne({ email });
    if (!user) {
        return res
            .status(400)
            .json(new ApiResponse(400, email, "Invalid request"));
    }

    const token = user.generateTemporaryToken();
    user.forgotPasswordToken = token.unHashedToken;
    user.forgotPasswordExpiry = token.tokenExpiry;
    await user.save();
    const emailUrl = `${process.env.BASE_URL}/v1/users/reset-password/${token.unHashedToken}`;
    const emailBody = emailVerificationMailGenContent(username, emailUrl);
    const options = {
        email: email,
        subject: "User password Reset",
        mailGenContent: emailBody,
    };
    await sendMail(options);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Reset link sent to email"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid request"));
    }

    const user = await User.findOne({
        forgotPasswordToken: token,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({
            message: "User token not matched or Token is expired",
        });
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currPassword, newPassword, confPassword } = req.body;
    const user = User.findOne({password: currPassword});
    if(!user){
        res.status(400).json(new ApiResponse(400, null, "Invalid credentials"))
    }
    if(newPassword !== confPassword){
        return res.status(400).json(new ApiResponse(400, null, "Password not matched"))
    }
    user.password = newPassword
    await user.save();
    return res.status(200).json(new ApiResponse(200, user.email, "Password updated"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // const { token } = req.user.token
    // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findOne({email: req.user.email})

    if(!user){
        return res.status(400).json(new ApiResponse(400, null, "Invalid User"))
    }

    return res.status(200).json(new ApiResponse(200, user, "User details send"))
});

export {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    resendVerificatonEmail,
    changeCurrentPassword,
    forgotPasswordRequest,
    refreshAccessToken,
    getCurrentUser,
    isImageUploadedLocal,
};
