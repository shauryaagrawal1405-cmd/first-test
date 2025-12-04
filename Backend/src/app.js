import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

const app = express();

// ✅ FIX 1: Correct CORS Configuration
// We removed the manual "res.setHeader" block because it conflicts with this.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // This must be your Render Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] // ✅ CRITICAL: Allows the token header
  })
);

app.use(express.json({ limit: "16kb" })); 
app.use(express.urlencoded({ extended: true, limit: "16kb" })); 
app.use(express.static("public")); 
app.use(cookieParser()); 

// Passport middleware
app.use(passport.initialize());

// Importing routes
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";

// Using routes
app.use("/user", userRouter);     // Matches Frontend: /user/unregistered/...
app.use("/auth", authRouter);     // Matches: /auth/google
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);

export { app };