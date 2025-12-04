import express from "express";
import { createRequest, getRequests, acceptRequest, rejectRequest } from "../controllers/request.controllers.js";
import { verifyJWT} from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, createRequest);
router.get("/getRequests", verifyJWT, getRequests);
router.post("/acceptRequest", verifyJWT, acceptRequest);
router.post("/rejectRequest", verifyJWT, rejectRequest);

export default router;
