import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    } 
    catch (error) {
        console.log("Mongodb connections failes", error);
        process.exit(1);
    }
};

export default connectDB;