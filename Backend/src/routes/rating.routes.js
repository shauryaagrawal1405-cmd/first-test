import express from "express";
import { rateUser } from "../controllers/rating.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/rateUser", verifyJWT, rateUser);
// router.get("/getRatings/:username", verifyJWT_username, getRatings);

export default router;
