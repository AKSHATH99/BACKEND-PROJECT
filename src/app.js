import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1600000" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from './routes/user.routes.js'

//routes
app.use("/api/v1/users",userRouter)

// https://localhost:8000/api/v1/users/register

import healtherCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/health", healtherCheckRouter)

import tweetRouter from "./routes/tweets.routes.js"
app.use("/api/v1/tweets", tweetRouter)

import videoRouter from "./routes/video.routes.js"
app.use("/api/v1/videos", videoRouter) 

import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments" , commentRouter)

import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/playlist", playlistRouter)

import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/subscription", subscriptionRouter)

import likeRouter from "./routes/like.routes.js"
app.use("/performLike", likeRouter)

import dashboardRouter from "./routes/dashboard.router.js"
app.use("/userDashboard", dashboardRouter)
export { app };
