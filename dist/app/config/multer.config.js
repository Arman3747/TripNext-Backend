"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            //my image.png => 2322323-2432322-my-image.png
            const fileName = file.originalname
                .toLowerCase()
                .replace(/\s+/g, "-") // remove space and insert dash(-)
                .replace(/\./g, "-")
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "");
            const extension = file.originalname.split(".").pop();
            const uniqueFileName = Math.random().toString(36).substring(2) +
                "-" +
                Date.now() +
                "-" +
                fileName +
                "." +
                extension;
            return uniqueFileName;
        },
    },
});
exports.multerUpload = (0, multer_1.default)({ storage: storage });
