import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(url: string, folder: string) {
  const { secure_url } = await cloudinary.uploader.upload(url, { 
    folder,
    transformation: [
      {
        overlay: "watermark_nvdxw8"
      }
    ]
  });
  return secure_url;
}