let mongoose=require("mongoose");
const newSchema1=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    AdmissionNumber:{
        type:String,
        required:true,
    },
    club:{
        type:String,
        required:true,
    },
    core:{
        type:Boolean,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
});
const Executives=mongoose.model("Executives",newSchema1);
module.exports=Executives;