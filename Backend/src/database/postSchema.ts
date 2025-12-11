import mongoose, { Schema } from "mongoose";

const postSchema=new Schema ({
    postTitle: { 
        type: String, 
        required: [true,"Title is Required"] 
    },
    postContent: { 
        type: String, 
        required: [true,"Please Write some contents"] 
    },
    postImages: [{ 
        type: String ,
        required:false
    }],
    postLikes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user" 
    }],
    postComments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "comment" 
    }],
    postOwner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        required: true
    },
    postTags: [{
        type:String,
        required:[true,"Please add some tags"] 
    }]
})

const postModel=mongoose.model("post",postSchema);

export default postModel;

/*
post{
    postTitle: { type: String, required: true },
    postContent: { type: String, required: true },
    postImages: [{ type: String }],
    postLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    postComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
    postOwner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    postTags: [{ type: String }]
}

*/