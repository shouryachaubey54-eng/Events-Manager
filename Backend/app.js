require('dotenv').config();
const mongoose = require('mongoose');
const multer=require('multer');
const {storage}=require("./cloudinaryconfig.js");
const upload=multer({storage});
let express=require("express");
let app=express();
app.listen(8080,()=>{
    console.log("listening");
})
const cors = require('cors');
const {MongoStore} = require('connect-mongo');
let History=require("./HistoryModel.js");
let Club=require("./ClubModel.js");

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true                
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

const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  'four-field-login',
  new LocalStrategy(
    {
     
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, 
    },
    async (req, email, password, done) => {
      try {
        const { admissionNumber, club } = req.body;

      
        const user = await Core.findOne({
          AdmissionNumber: admissionNumber,
          email: email,
          club: club,
        });

    
        if (!user) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

      
        const isMatch = (password===user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

       
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.use(
  'four-field-login-exe',
  new LocalStrategy(
    {
    
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { admissionNumber, club } = req.body;

        
        const user = await Executives.findOne({
          AdmissionNumber: admissionNumber,
          email: email,
          club: club,
        });

      
        if (!user) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

     
        const isMatch = (password===user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials provided.' });
        }

   
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Core.findById(id);
    const userexe=await Executives.findById(id);
    let originaluser=user?user:userexe;
    done(null, originaluser);
  } catch (err) {
    done(err);
  }
});


app.post('/new/login/core', (req, res, next) => {
  passport.authenticate('four-field-login', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

   
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({"status":"true"});
    });
  })(req,res,next)
});
app.post('/new/login/executive', (req, res, next) => {
  passport.authenticate('four-field-login-exe', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

   
    req.logIn(user, (err) => {
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
app.post('/new/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
    
      res.clearCookie('connect.sid'); 
      res.json({"status":"done"});
    });
  });
});
app.post("/new/bill",upload.single('slip'),(req,res)=>{
  res.json(req.file);
})
app.post("/new/bill/submit",async (req,res)=>{
  //body,History,Club
  let data=req.body;
  let history=new History(data);
  await history.save();
  res.json({"saved":"true"});

})
app.get("/new/club/:club",async (req,res)=>{
  let {club}=req.params;
  let response=await Club.find({clubName:club});
  res.json(response);
})
app.get("/new/history/:club",async (req,res)=>{
  let {club}=req.params;
  let response=await History.find({clubName:club});
  res.json(response);
})
app.get("/new/reduce/:amount/:club",async (req,res)=>{
  let {club,amount}=req.params;
  let numericAmount = Number(amount);
  let response=await Club.findOneAndUpdate({ clubName: club },{ $inc: { leftAmount:-numericAmount }});
  res.json({"done":"true"});
})
app.get("/new/verify/:id",async (req,res)=>{
  let {id}=req.params;
  await History.findByIdAndUpdate(id,{verified:true});
  res.json({"done":"true"});
})