import multer from "multer";
import { asyncHandler } from "../utils/async-handler.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

const isImageUploadedLocal = asyncHandler(async (req, res, next) => {
    try {
        if(req.file){
          next()
        }
    } 
    catch (error) {
        console.log(error);
        throw new ApiError(401, "Avatar file not uploaded", error);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1 * 1000 * 1000
    } 
});

export { upload, isImageUploadedLocal }