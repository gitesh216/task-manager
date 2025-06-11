import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {asyncHandler} from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import User from "../models/user.model.js"
import { ProjectMember } from "../models/projectmember.model.js"
import mongoose from "mongoose"

dotenv.config()

export const isLoggedIn = async (req, res, next) => {
    // 1. Token leke aao - cookie se
    // 2. Token ko check karo - hai ya nahi
    // 3. Token se data nikal lo
    try {
        console.log(req.cookies)
        // const token = req.cookies?.token
        const token = req.cookies.accessToken || ""

        console.log("Token Found: ", token ? "Yes" : "No");

        if(!token){
            console.log("No token");
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }
        
        const decoded_data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Decoded data: ", decoded_data);
        req.user = decoded_data
        next()
    } 
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server: Error in catch of isLoggedIn"
        })
    }
};


// Approach 2
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");

    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry");

    if(!user){
        throw new ApiError(401, "Unauthorized request")
    }

    req.user = user
    next(); 
});


export const validateProjectPermission = (roles = []) => asyncHandler(async (req, res, next) => {
    
    const projectId = req.params?.projectId;
    if(!projectId){
        throw new ApiError(400, "Project Id is required")
    }
   
    const projectMem = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(req.user._id),
    });

    if(!projectMem){
        throw new ApiError(403, "Access denied")
    }

    const givenRole = projectMem?.role;

    req.user.role = givenRole;

    if(!roles.includes(givenRole)){
        throw new ApiError(403, "Access denied")
    }
    next();
}); 