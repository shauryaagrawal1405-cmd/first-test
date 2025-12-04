import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from Cookies OR Header
    const token =
      req.cookies?.accessToken ||
      req.cookies?.accessTokenRegistration ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Please Login");
    }

    // 2. Verify Token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find User
    // First, try to find a Registered User
    let user = await User.findById(decodedToken?._id);

    // If not found, try to find an Unregistered User (Registration Phase)
    if (!user) {
      // Logic: Try finding by ID first (Best), fallback to email if ID missing
      if (decodedToken?._id) {
        user = await UnRegisteredUser.findById(decodedToken._id);
      } else if (decodedToken?.email) {
        user = await UnRegisteredUser.findOne({ email: decodedToken.email });
      }
    }

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // ✅ CRITICAL FIX: We do NOT use .select("-_id") here.
    // We need the full user object (including _id) to save details later.
    req.user = user;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
       throw new ApiError(401, "Session Expired, Please Login Again");
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});