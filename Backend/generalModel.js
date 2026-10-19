let mongoose=require("mongoose");
const newSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    }
});
const General=mongoose.model("General",newSchema);
module.exports=General;