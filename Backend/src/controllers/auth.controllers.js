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

// ✅ CRITICAL: Ensure this matches your deployed Frontend URL in Render Env
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true // Required for Render
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
  failureRedirect: `${CLIENT_URL}/login`,
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");

  const existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    const jwtToken = generateJWTToken_username(existingUser);
    
    // ✅ FIX: Pass token in URL query parameter
    return res.redirect(`${CLIENT_URL}/discover?token=${jwtToken}&type=login`);
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
  
  // ✅ FIX: Pass token in URL query parameter
  return res.redirect(`${CLIENT_URL}/register?token=${jwtToken}&type=register`);
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