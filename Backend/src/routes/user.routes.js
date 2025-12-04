import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

// ✅ FIX 1: Import the Middleware that checks HEADERS (not just cookies)
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js"; 

// ✅ FIX 2: Import the NEW controllers that handle saving without deleting Name/Email
// (Ensure you created this file in the previous step!)
import {
  getUnRegisteredUserDetails,
  saveRegDetails,
  saveEduDetail,
  saveAddDetail
} from "../controllers/unRegisteredUser.controller.js";

// Import existing controllers for Registered users
import {
  UserDetails,
  registerUser, // This handles the final conversion from Unregistered -> Registered
  userDetailsWithoutID,
  saveRegRegisteredUser,
  saveEduRegisteredUser,
  saveAddRegisteredUser,
  uploadPic,
  discoverUsers,
  sendScheduleMeet,
} from "../controllers/user.controllers.js";

const router = Router();

// ==========================================
// UNREGISTERED USER ROUTES (Registration Phase)
// ==========================================

// ✅ Use 'verifyJWT' (which checks Headers) and the new controllers
router.route("/unregistered/getDetails").get(verifyJWT, getUnRegisteredUserDetails);
router.route("/unregistered/saveRegDetails").post(verifyJWT, saveRegDetails);
router.route("/unregistered/saveEduDetail").post(verifyJWT, saveEduDetail);
router.route("/unregistered/saveAddDetail").post(verifyJWT, saveAddDetail);

// This handles the final submit
router.route("/registerUser").post(verifyJWT, registerUser);


// ==========================================
// REGISTERED USER ROUTES (Main App)
// ==========================================

// You can keep verifyJWT_username here IF it works for logged-in users, 
// BUT it is safer to use 'verifyJWT' here too.
router.route("/registered/saveRegDetails").post(verifyJWT, saveRegRegisteredUser);
router.route("/registered/saveEduDetail").post(verifyJWT, saveEduRegisteredUser);
router.route("/registered/saveAddDetail").post(verifyJWT, saveAddRegisteredUser);

// Upload Picture
router.route("/uploadPicture").post(verifyJWT, upload.fields([{ name: "picture", maxCount: 1 }]), uploadPic);

// get user details
router.route("/registered/getDetails/:username").get(verifyJWT, UserDetails);
router.route("/registered/getDetails").get(verifyJWT, userDetailsWithoutID);

// get profiles for discover page
router.route("/discover").get(verifyJWT, discoverUsers);

// send schedule meet email
router.route("/sendScheduleMeet").post(verifyJWT, sendScheduleMeet);

export default router;