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
const fakeData = [
  {
    email: "123",
    password:"123",
    AdmissionNumber: "123",
    club: "1",
    core: false
  },
//   {
//     email: "priya.verma@example.com",
//     password:"321",
//     AdmissionNumber: "23BIT045",
//     club: "Robotics Society",
//     core: false
//   }
];

// //Assuming your model is named Student
// async function seedDB() {
//   try {
//     await Executives.insertMany(fakeData);
//     console.log("Fake data inserted successfully!");
//   } catch (err) {
//     console.error("Error inserting fake data:", err);
//   }
// }

// seedDB();
module.exports=Executives;