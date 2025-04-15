import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server is running on", PORT);
        })
    })
    
const PORT = process.env.PORT || 8000;

