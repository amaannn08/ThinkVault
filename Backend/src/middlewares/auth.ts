import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET=process.env.JWT_SECRET as string;
async function auth(req:Request,res:Response,next:NextFunction){
    const authHeader=req.headers.authorization;
    if(!authHeader || typeof authHeader !== "string" ||!authHeader.startsWith("Bearer ")){
        return res.status(403).json({
            message:"Invalid Token"
        })
    }
    const token=authHeader.split(" ")[1];
    try {
        const decoded=jwt.verify(token,JWT_SECRET);
        req.user=decoded;
        next();
    } catch (error:any) {
        return res.status(403).json({
            message:"Token Expired or Invalid"
        })
    }
}

export default auth;