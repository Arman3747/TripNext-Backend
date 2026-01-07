/* eslint-disable @typescript-eslint/no-explicit-any */
//Multer -> Form data -> File -> Uploads Folder -> Req.File = Image
//Frontend -> Form data with image File -> Multer-> Form data -> Req(Body + File)
// Amader Folder -> image -> form data -> File -> Multer -> Nijer akta folder(temporary)  -> Req.file
//req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import stream from "stream";

export interface ICloudinaryResult {
  url: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  original_filename: string;
}

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${fileName}-${Date.now()}`;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: public_id,
            folder: "pdf",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    throw new AppError(401, `Error uploading file ${error.message}`);
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

export const deleteImageFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

    const match = url.match(regex);
    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      // eslint-disable-next-line no-console
      console.log(`File ${public_id} is deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new AppError(401, "Cloudinary image deletion failed", error.message);
  }
};

export const cloudinaryUpload = cloudinary;
