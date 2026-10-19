let mongoose=require("mongoose");
const newSchema2=new mongoose.Schema({
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
        required:true
    },
    password:{
      type:String,
      required:true,  
    },
    core:{
        type:Boolean,
        required:true,
    }
});
const CoreMember=mongoose.model("CoreMember",newSchema2);
module.exports=CoreMember;