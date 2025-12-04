import express from "express";
import { createChat, getChats } from "../controllers/chat.controllers.js";
import { verifyJWT} from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createChat);
router.get("/", verifyJWT, getChats);
// router.get("/:id", verifyJWT_username, getChatById);

export default router;
