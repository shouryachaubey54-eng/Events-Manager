let mongoose=require("mongoose");
let History=require("./HistoryModel.js")
const newSchema2=new mongoose.Schema({
    clubName:{
        type:String,
        required:true,
    },
    allotedAmount:{
        type:Number,
        required:true,
    },
    leftAmount:{
        type:Number,
        required:true,
    },
});
const Club=mongoose.model("Club",newSchema2);
module.exports=Club;