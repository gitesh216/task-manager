import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/auth.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"
import projectRouter from "./routes/project.routes.js"
import noteRouter from "./routes/note.routes.js";
import taskRouter from "./routes/task.routes.js";


const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/project", projectRouter)
app.use("/api/v1/note", noteRouter)
app.use("/api/v1/task", taskRouter)


export default app;
