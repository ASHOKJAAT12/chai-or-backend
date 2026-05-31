import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINAMRY_CLOUD_NAME,
    api_key: process.env.CLOUDINAMRY_API_KEY,
    api_secret: process.env.CLOUDINAMRY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            }
        )
        fs.unlinkSync(localFilePath);
        console.log("cloudinary upload successfully.",response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("cloudinary upload faild",error);
        return null;
    }
}

export { uploadOnCloudinary };