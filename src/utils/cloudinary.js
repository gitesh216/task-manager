import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = "general") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: `Project_Camp/${folder}`,
        });

        console.log("✅ File uploaded to Cloudinary:", response.secure_url);

        // Delete local file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } 
    catch (error) {
        console.error(
            `❌ Cloudinary upload error for ${localFilePath}:`, error);

        // Cleanup local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

const deleteOnCloudinary = async (url, folder) => {
    try {
        if (!url) 
            return null;
        // Getting public key from URL
        console.log(url);
        const urlArray = url.split("/");
        console.log(urlArray);

        const image = urlArray[urlArray.length - 1];
        console.log(image);

        const imagePublicId = `Project_Camp/${folder}/${image.split(".")[0]}`;
        console.log(imagePublicId);

        const response = await cloudinary.uploader.destroy(imagePublicId);
        console.log("File is deleted on cloudinary", response.result); // If file not found then response.result = not found & if file is deleted response.result = ok

        return response;
    } 
    catch (error) {
        console.log(error);
        return null;
    }
};
export { uploadOnCloudinary, deleteOnCloudinary };
