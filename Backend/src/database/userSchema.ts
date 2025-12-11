import mongoose, { Schema } from "mongoose";
import { User } from "./zod.js";

const userSchema=new Schema <User>({
    firstName:{
        type:String,
        required:[true,"First Name is Required"]
    },
    lastName:{
        type:String,
        required:false
    },    
    email:{
        type:String,
        required:[true,"Email is Required"],
        unique:true
    },
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    userName:{
        type: String,
        required: [true, "User ID is required"],
        unique:true
    }
})

const userModel=mongoose.model<User>("user",userSchema);

export default userModel;
