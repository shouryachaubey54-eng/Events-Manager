const mongoose = require('mongoose');
let express=require("express");
require('dotenv').config();
let app=express();
app.listen(8080,()=>{
    console.log("listening");
})
const cors = require('cors');
const {MongoStore} = require('connect-mongo');
// Session middleware configuration

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend's actual URL/port
    credentials: true                // Crucial for allowing session cookies
}));
app.use(express.text());
app.use(express.json())
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
connectDB();
let Executives=require("./ExecutiveModel.js");
let Core=require("./CoreModel.js");
let Events=require("./eventModel.js");
let {loginmiddleware}=require("./middleware.js");
let {editmiddleware}=require("./middleware.js");
// getting-started.js
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
// 1. Body parser middleware (so req.body is populated)
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions', // Name of the collection in Atlas where sessions will be saved
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day (adjust as needed)
      secure: process.env.NODE_ENV === 'production', // true if using HTTPS in production
      httpOnly: true,
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());//this works because of express-session.
const LocalStrategy = require('passport-local').Strategy;//local-strategy to chack authenticate user
//passport.use(new)
passport.use(//method to authenticate user 
  'four-field-login',
  new LocalStrategy(
    {
      // Map Passport's internal standard fields to your form's fields
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // Crucial: exposes req.body to the verify function
    },
    async (req, email, password, done) => {
      try {
        const { admissionNumber, club } = req.body;

        // 1. Single database query matching all multi-attribute identifiers
        const user = await Core.findOne({
          AdmissionNumber: admissionNumber,
          email: email,
          club: club,
        });

        // 2. If no user matches all three credentials, return generic error
        if (!user) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

        // 3. Verify the password hash
        const isMatch = (password===user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

        // 4. Return user on success
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.use(//method to authenticate user 
  'four-field-login-exe',
  new LocalStrategy(
    {
      // Map Passport's internal standard fields to your form's fields
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // Crucial: exposes req.body to the verify function
    },
    async (req, email, password, done) => {
      try {
        const { admissionNumber, club } = req.body;

        // 1. Single database query matching all multi-attribute identifiers
        const user = await Executives.findOne({
          AdmissionNumber: admissionNumber,
          email: email,
          club: club,
        });

        // 2. If no user matches all three credentials, return generic error
        if (!user) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

        // 3. Verify the password hash
        const isMatch = (password===user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

        // 4. Return user on success
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {//after authentication this is used to store users info as ID in the session
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {//this is used to get back users data from id req.user is used from this method
  try {
    const user = await Core.findById(id);
    const userexe=await Executives.findById(id);
    let originaluser=user?user:userexe;
    done(null, originaluser);
  } catch (err) {
    done(err);
  }
});

// let General=require("./generalModel.js");
app.post('/new/login/core', (req, res, next) => {
  passport.authenticate('four-field-login', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    // Log the user in and establish session
    req.logIn(user, (err) => {//this triuggers serializeUser and saves users info as Id
      if (err) return next(err);
      res.json({"status":"true"});
    });
  })(req,res,next)
});
app.post('/new/login/executive', (req, res, next) => {
  passport.authenticate('four-field-login-exe', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    // Log the user in and establish session
    req.logIn(user, (err) => {//this triuggers serializeUser and saves users info as Id
      if (err) return next(err);
      res.json({"status":"true"});
    });
  })(req,res,next)
});
app.post("/new/events",async (req,res)=>{
    let date=req.body;
    let events=await Events.find({date:date});
    res.json(events);
})
app.post("/new/add/:date",loginmiddleware,async (req,res)=>{
    let event=req.body;
    let {date}=req.params;
    let club=req.user.club;
    let timeStr1 =event.startTime;
    let parts1 = timeStr1.split(":");
    let hours1 = Number(parts1[0]);
    let minutes1 = Number(parts1[1]);
    let totalMinutes1 = hours1 * 60 + minutes1;
    event.startTime=totalMinutes1;
    let timeStr2 =event.endTime;
    let parts2 = timeStr2.split(":");
    let hours2 = Number(parts2[0]);
    let minutes2 = Number(parts2[1]);
    let totalMinutes2 = hours2 * 60 + minutes2;
    event.endTime=totalMinutes2;
    event.date=date;
    event.club=club;
    const Event=new Events(event);
    await Event.save();
    let response=await Events.find({date:date});
    res.json(response);
})
app.post("/new/edit/:id",editmiddleware,async (req,res)=>{
    let {id}=req.params;
    let event=req.body;
    let club=req.user.club;
    console.log(club);
    let response=await Events.find({_id:id});
    console.log(response[0].club);
    if(response[0].club!=club){
      return res.json({"club":"false"});
    }
    let timeStr1 =event.startTime;
    let parts1 = timeStr1.split(":");
    let hours1 = Number(parts1[0]);
    let minutes1 = Number(parts1[1]);
    let totalMinutes1 = hours1 * 60 + minutes1;
    event.startTime=totalMinutes1;
    let timeStr2 =event.endTime;
    let parts2 = timeStr2.split(":");
    let hours2 = Number(parts2[0]);
    let minutes2 = Number(parts2[1]);
    let totalMinutes2 = hours2 * 60 + minutes2;
    event.endTime=totalMinutes2;
    let result=await Events.findByIdAndUpdate(id,{title:event.title,startTime:event.startTime,endTime:event.endTime});
    let events=await Events.find({date:result.date});
    res.json(events);
})
app.get("/new/all",async (req,res)=>{
    let data=await Events.find();
    res.json(data);
})
app.get("/new/user",(req,res)=>{
  console.log(req.user);
  if(req.user){
    return res.json(req.user);
  }
  res.json({"Notfound":"server"});
})