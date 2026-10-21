let mongoose=require("mongoose");
const newSchema2=new mongoose.Schema({
    clubName:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    slip:{
        type:String,
        required:true,
    },
    verified:{
        type:Boolean,
        required:true,
    },
    uploadedBy:{
        type:String,
        required:true,
    }
});
const History=mongoose.model("History",newSchema2);
module.exports=History;