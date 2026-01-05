//Multer -> Form data -> File -> Uploads Folder -> Req.File = Image
//Frontend -> Form data with image File -> Multer-> Form data -> Req(Body + File)
// Amader Folder -> image -> form data -> File -> Multer -> Nijer akta folder(temporary)  -> Req.file
//req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb

import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;
