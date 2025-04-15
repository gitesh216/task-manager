import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const isLoggedIn = async (req, res, next) => {
    // 1. Token leke aao - cookie se
    // 2. Token ko check karo - hai ya nahi
    // 3. Token se data nikal lo
    try {
        console.log(req.cookies)
        // const token = req.cookies?.token
        const token = req.cookies.token || ""

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