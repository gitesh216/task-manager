import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/auth.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"
import projectRouter from "./routes/project.routes.js"

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/project", userRouter)

export default app;
