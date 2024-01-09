import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //this package comes by default with node js , no need to install seperately , it manage all file system work like upload , delete synchrously or asynchronously

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response=await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully
    // console.log("File uploaded successfully on cloudinary",response.url);
    fs.unlinkSync(localFilePath) //file will remove from locally after successfully upload on cloudinary
    
    return response

  } catch (error) {
    fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload option got failed

    return null

  }
};

export {uploadOnCloudinary}



//code available on cloudinary website
// cloudinary.v2.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );
