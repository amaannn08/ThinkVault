import mongoose, { Schema } from "mongoose";

const commentSchema=new Schema ({
    commentContent: { 
        type: String, 
        required: [true,"Content is Required"] 
    },
    commentImages: [{ 
        type: String ,
        required:false
    }],
    commentLikes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user" 
    }],
    commentOwner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true
    }
})

const commentModel=mongoose.model("comment",commentSchema);

export default commentModel;
