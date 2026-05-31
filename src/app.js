import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(express.static("public"));
app.use(express.urlencoded({
    limit: "16kb",
    extended: true
}))
app.use(cookieParser());





import userRouter from './routes/user.routes.js';

app.use("/api/v1/users",userRouter)



export { app };