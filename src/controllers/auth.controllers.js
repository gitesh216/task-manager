import { asyncHandler } from "../utils/async-handler.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendMail, emailVerificationMailGenContent } from "../utils/mail.js";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/api-response.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { log } from "console";

dotenv.config();

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullname } = req.body;
    console.log(email);

    const existingUser = User.findOne({ email });
    if (!existingUser) {
        console.log(existingUser.email);
        throw new ApiError(409, "User with email or username already exists");
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
        throw new ApiError(400, "User not registered");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        newUser.generateTemporaryToken();
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
        "-password -emailVerificationToken -emailVerificationExpiry",
    );
    console.log(createdUser);

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { email: createdUser.email },
                "User Registered Successfully",
            ),
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
    await user.save();
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict", // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict", // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                email,
                username: user.username,
                fullname: user.fullname,
            },
            "Login successful",
        ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        { new: true },
    );
    const options = {
        httpOnly: true,
    }
    res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)

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
            new ApiResponse(200, { isEmailVerified: true }, "Email verification successful"),
        );
});

const resendVerificatonEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Invalid email");
    }
    if (user.isEmailVerified) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    { email: user.email },
                    "User is verified, please login",
                ),
            );
    }
    const { hashedToken, unHashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = unHashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save();

    // Send email

    const emailBody = emailVerificationMailGenContent(
        user.username,
        `${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    );

    const options = {
        email: email,
        subject: "User email Verification",
        mailGenContent: emailBody,
    };

    await sendMail(options);

    return res
        .status(201)
        .json(new ApiResponse(201, null, "Verification email send"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }
    const decoded_data = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded_data?._id);
    if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }
    // check incoming and user document refresh token, same or not
    // if they are same, then proceed
    // if not, throw error Expired refresh token
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }
    const cookieOptions = {
        httpOnly: true
    };
    const newAccessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();
    user.refreshToken = newRefreshToken
    await user.save();

    res.cookie("accessToken", cookieOptions);
    res.cookie("refreshToken", cookieOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            { accessToken : newAccessToken, refreshToken: newRefreshToken },
            "Access token refreshed"
        )
    );
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exists", []);
    }

    const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.forgotPasswordToken = unHashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
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
        .json(
            new ApiResponse(200, null, "Reset link sent to user email")
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!token || !password) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Invalid request"));
    }

    const user = await User.findOne({
        forgotPasswordToken: resetToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Password reset successfully")
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;
    const user = await User.findById(req.user?._id);

    const isPasswordValid = user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid old password");
    }

    // assign new password in plain text
    // We have a pre save method attached to user schema which automatically hashes the password whenever added/modified
    user.password = newPassword
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
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
    resetPassword
};
