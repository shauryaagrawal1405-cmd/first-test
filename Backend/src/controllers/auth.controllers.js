import { generateJWTToken_email, generateJWTToken_username } from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dotenv.config();

// Define the Frontend URL dynamically
// On Render, this should be "https://skillswap-frontend.onrender.com"
// Locally, it is "http://localhost:5173"
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // ✅ FIX 1: Use the exact env variable to ensure HTTPS matches Google Console
      callbackURL: process.env.GOOGLE_CALLBACK_URL, 
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

export const googleAuthHandler = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  // ✅ FIX 2: Use dynamic CLIENT_URL instead of localhost
  failureRedirect: `${CLIENT_URL}/login`, 
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");
  
  const existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    const jwtToken = generateJWTToken_username(existingUser);
    const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
    
    // ✅ FIX 3: Secure cookies for Production (Render uses HTTPS)
    res.cookie("accessToken", jwtToken, { 
      httpOnly: true, 
      expires: expiryDate, 
      secure: true, // Set to true for Render (HTTPS), false for localhost
      sameSite: "None" // Required for cross-site cookies (Frontend/Backend on different domains)
    });
    
    // ✅ FIX 4: Redirect to live site, not localhost
    return res.redirect(`${CLIENT_URL}/discover`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email: req.user._json.email });
  if (!unregisteredUser) {
    console.log("Creating new Unregistered User");
    unregisteredUser = await UnRegisteredUser.create({
      name: req.user._json.name,
      email: req.user._json.email,
      picture: req.user._json.picture,
    });
  }
  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 0.5 * 60 * 60 * 1000);
  
  res.cookie("accessTokenRegistration", jwtToken, { 
    httpOnly: true, 
    expires: expiryDate, 
    secure: true, // Set to true for Render
    sameSite: "None" // Required for cross-site
  });
  
  // ✅ FIX 5: Redirect to live site, not localhost
  return res.redirect(`${CLIENT_URL}/register`);
});

export const handleLogout = (req, res) => {
  console.log("\n******** Inside handleLogout function ********");
  res.clearCookie("accessToken", {
     httpOnly: true,
     secure: true,
     sameSite: "None"
  });
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};