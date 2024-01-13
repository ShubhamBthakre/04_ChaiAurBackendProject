import { v2 as cloudinary } from "cloudinary";
import { extractPublicId, } from 'cloudinary-build-url'
//this package comes by default with node js , no need to install seperately , it manage all file system work like upload , delete synchrously or asynchronously
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    //todo:-if localfilePath is not there then we can return error like "file could not attack or link"
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response=await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("cloudinary response",response)

    //file has been uploaded successfully
    console.log("File uploaded successfully on cloudinary",response.url);
    fs.unlinkSync(localFilePath); //file will remove from locally after successfully upload on cloudinary
    
    return response

  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload option got failed

    return null

  }
};


const deleteCloudinaryOldImage = async(imageUrl)=>{
  try {

    const publicId = await extractPublicId(
      imageUrl
    );

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        throw new ApiError(401,`Error deleting image:, ${error}`)
      } else {
        console.log('Image deleted successfully:', result);
        return result
      }
    });
    
    
    
  } catch (error) {
    throw new ApiError(401,`Error deleting image:, ${error}`)
  }
}

export {uploadOnCloudinary,deleteCloudinaryOldImage}



//code available on cloudinary website
// cloudinary.v2.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

