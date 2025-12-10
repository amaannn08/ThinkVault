import mongoose, { Schema } from "mongoose";
import { User } from "./zod.js";
const schema=mongoose.Schema;

const userSchema=new Schema <User>({
    userId:{
        type: String,
        required: [true, "User ID is required"]
    },
    password:{
        type: String,
        required: [true, "Password is required"]
    }
})

const userModel=mongoose.model<User>("user",userSchema);

export default userModel;