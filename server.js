const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { ensureAuthenticated } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Company = require('./models/company');

// Configure MongoDB
mongoose.connect("mongodb+srv://pramaths848:MdNy3gukvjpzydQe@twitter.t29mhxx.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser:true,
 // useUnifieldTopology:true,
})
.then(()=> console.log("CONNECTED TO MONGO DB DATABASE 🌐"))
.catch((err)=>console.log(err))

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: '263326962892-4m4q4islrfnubdc09ruc7mlv51gbu70m.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://timepassss.onrender.com/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // User already exists
          return done(null, existingUser);
        }

        // User doesn't exist, create a new one
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        });

        // Save the new user to the database
        await newUser.save();

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const app = express();
app.use(cors());

// Set up Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up Express session
app.use(
  session({
    secret: 'pramaths',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated
    return next();
  } else {
    // User is not authenticated
    res.redirect("/")}
};
// Define the routes
app.get('/', (req, res) => {
  res.redirect('https://internbro.com/');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    
    res.redirect('https://internbro.com/jobs');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(); // Clear the user's session
  res.redirect('https://internbro.com/');
});

// Add authentication middleware
app.post('/api/companies',async (req, res) => {
  try {
  const {
      companyName,
      imageUrl,
      skills,
    stipend,
      redirectUrl,
      location,
      role,
      aboutUs,
      responsibility,
      qualification,
      bonusQualification,
    } = req.body;


    // Create a new company document
   const newCompany = new Company({
      companyName,
      imageUrl,
      skills,
     stipend,
      redirectUrl,
      location,
      role,
      aboutUs,
      responsibility,
      qualification,
      bonusQualification,
    });

    // Save the new company to the database
    const savedCompany = await newCompany.save();

    res.status(201).json(savedCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the company' });
  }
});
app.get('/api/jobs',async (req, res) => {
  try {
    // Fetch all job documents from the database
    const jobs = await Company.find();
//res.send("hello")
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job data:', error);
    res.status(500).json({ error: 'An error occurred while fetching job data' });
  }
});
app.get("/api/jobs/:id",async(req,res)=>{
  const {id}=req.params;
  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  }catch(error){
    console.log("i am fucked",error)
    res.status(500).json({error:"i am fucked"})
  }
})

// Start the server
const port = process.env.PORT||8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
