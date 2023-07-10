const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
//const cors = require('cors');
require('dotenv').config();
// Require the User and Company models
const User = require('./models/user');
const Company = require('./models/company');
console.log(process.env.database)
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
      clientID: '786564672166-q90l7ahitkpnbfd2busvisdemteoidqs.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: '/auth/google/callback',
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
//app.use(cors());

// Set up Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up Express session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Define the routes
app.get('/', (req, res) => {
  res.redirect('https://internbro-pramaths.vercel.app/');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('https://internbro-pramaths.vercel.app/jobs');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(); // Clear the user's session
  res.redirect('https://internbro-pramaths.vercel.app/');
});

// Add authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated
    return next();
  } else {
    // User is not authenticated
    res.redirect('https://internbro-pramaths.vercel.app/');
  }
};
app.post('https://timepassss.onrender.com/api/companies',async (req, res) => {
  try {
    const { companyName, imageUrl, skills, redirectUrl, location, role } = req.body;

    // Create a new company document
    const newCompany = new Company({
      companyName,
      imageUrl,
      skills,
      redirectUrl,
      location,
      role,
    });

    // Save the new company to the database
    const savedCompany = await newCompany.save();

    res.status(201).json(savedCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the company' });
  }
});
app.get('https://timepassss.onrender.com/api/jobs', async (req, res) => {
  try {
    // Fetch all job documents from the database
    const jobs = await Company.find();
res.send("hello")
   // res.json(jobs);
  } catch (error) {
    console.error('Error fetching job data:', error);
    res.status(500).json({ error: 'An error occurred while fetching job data' });
  }
});
// Start the server
const port = process.env.PORT||8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
