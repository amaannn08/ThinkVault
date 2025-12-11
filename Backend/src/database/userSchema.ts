import mongoose, { Schema } from "mongoose";

const userSchema=new Schema({
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

const userModel=mongoose.model("user",userSchema);

export default userModel;
