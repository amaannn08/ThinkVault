import {Router} from "express";
import userModel from "../database/userSchema.js";
import { UserSignup, userSignupZodSchema ,userSigninZodSchema ,UserSignin, userSearchZodSchema, UserSearch} from "../database/zod.js";
import bcrypt from "bcrypt";
import auth from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
const userRouter=Router();


userRouter.post("/signup",async (req,res)=>{
    try {
        const result=userSignupZodSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message:"Invalid Input",
                error:result.error.flatten()
            });
        }
        const data:UserSignup=result.data;
        const {firstName,lastName,email,password,userName}=data;
        
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message:"User Already Exists"
            })
        }

        const hashedPassword=await bcrypt.hash(password,10);
        const user= await userModel.create({
            firstName,lastName,email,password:hashedPassword,userName
        })
        res.json({
            message:"User Created"
        })
    }catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "User Already Exists" });
        }
        return res.status(500).json({ message: "Signup Failed" });
}

});

userRouter.post("/signin",async (req,res)=>{
    try {
        const result=userSigninZodSchema.safeParse(req.body);
        if(!result.success){
            return res.status(500).json({
                message:"Invalid Input",
                error:result.error.flatten()
            })
        }
        const data:UserSignin=result.data;
        const {userName,password}=data;
        const user=await userModel.findOne({userName});
        if(!user){
            return res.status(400).json({
                message:"Invalid Username or Password"
            })
        }
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid Username or Password"
            })
        }

        

        return res.status(200).json({
            message:"Signed In"
        })
    } catch (error:any) {
        console.log("Signin Failed");
        return res.status(400).json({
            message:"Signin Failed"
        })
    }
});

userRouter.get("/profile",auth,async (req,res)=>{
    try {
        const result=userSearchZodSchema.safeParse(req.body);
        if(!result.success){
            return res.json({
                message:"Invalid Input"
            })
        }
        const data:UserSearch=result.data;
        const {userName}=data;
        //He will be able to get the profile only if token is verified
    } catch (error) {
        
    }
});

userRouter.put("/updateProfile",(req,res)=>{
    
})

userRouter.get("/anotherUser",(req,res)=>{
    
})

export default userRouter;