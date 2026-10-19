let mongoose=require("mongoose");
let schema1=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true
    },
    startTime:{
        type:Number,
        required:true,
    },
    endTime:{
        type:Number,
        required:true,
    },
    club:{
        type:String,
        required:true,
    }
})
const Event=mongoose.model("Event",schema1);
module.exports=Event;