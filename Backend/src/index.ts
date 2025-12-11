import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userRouter from "./Routes/userRoutes.js";
import dotenv from "dotenv"
dotenv.config();
const port = Number(process.env.PORT);
const url = process.env.MONGODB_URL as string;
const app=express();
app.use(express.json());

app.use("/auth",userRouter);

mongoose.connect(url).then(()=>{
    console.log("Connected To DB");
    app.listen(3000,()=>{
        console.log(`Listening at Port ${port}`);
    })
}).catch((error)=>{
    console.log("Error Connecting to DB");
});
