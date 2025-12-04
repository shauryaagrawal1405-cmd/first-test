import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controllers.js";
import { verifyJWT} from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/sendMessage", verifyJWT, sendMessage);
router.get("/getMessages/:chatId", verifyJWT, getMessages);

export default router;
