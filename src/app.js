import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter)

export default app;
