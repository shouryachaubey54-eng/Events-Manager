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
// async function func(){
//     const fakeUser = new CoreMember({
//         email: "student123@college.edu",
//         AdmissionNumber: "ADM-2026-089",
//         club: "Coding Club",
//         password: "123",
//         core:true,
//     });
//     fakeUser.save()
//     .then(()=>{
//         console.log("saved");
//     })
//     .catch((err)=>{
//         console.log("not added");
//     })
// }
// func();
module.exports=CoreMember;