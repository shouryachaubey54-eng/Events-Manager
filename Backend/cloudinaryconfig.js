const cloudinary=require("cloudinary").v2;
const {CloudinaryStorage}=require("multer-storage-cloudinary-v2");
cloudinary.config({
    cloud_name:process.env.cloud_Name,
    api_secret:process.env.api_Secret,
    api_key:process.env.api_Key
});
const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"New-folder",
        allowedformats:["jpg","png","jpeg"]
    }
})
module.exports={cloudinary,storage};