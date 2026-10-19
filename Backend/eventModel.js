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
// const fakeEventsData = [
//     {
//         title: "Team Sync",
//         date: "2026-10-15",
//         startTime: 540,  // 9:00 AM (9 * 60)
//         endTime: 600     // 10:00 AM (10 * 60)

//     },
//     {
//         title: "Project Review",
//         date: "2026-10-15",
//         startTime: 630,  // 10:30 AM (10 * 60 + 30)
//         endTime: 720     // 12:00 PM (12 * 60)
//     },
//     {
//         title: "Code Refactoring",
//         date: "2026-10-16",
//         startTime: 840,  // 2:00 PM (14 * 60)
//         endTime: 960     // 4:00 PM (16 * 60)
//     },
//     {
//         title: "UI/UX Design Workshop",
//         date: "2026-10-17",
//         startTime: 600,  // 10:00 AM (10 * 60)
//         endTime: 690     // 11:30 AM (11 * 60 + 30)
//     },
//     {
//         title: "Client Pitch",
//         date: "2026-10-17",
//         startTime: 1020, // 5:00 PM (17 * 60)
//         endTime: 1110    // 6:30 PM (18 * 60 + 30)
//     }
// ]
// async function seedDB() {
//     try {
//         await Event.insertMany(fakeEventsData);
//         console.log("Fake event data inserted successfully!");
//     } catch (error) {
//         console.error("Error inserting fake data:", error);
//     }
// }

// seedDB();
module.exports=Event;