import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "events",
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    public_id: file.originalname.split(".")[0],
  }),
});

const parser = multer({ storage });
export default parser;
