import * as z from "zod";

export const userZodSchema=z.object({
    firstName:z.string().min(1,"At Least 1 Character"),
    lastName:z.string().min(1,"At Least 1 Character").optional(),
    email: z.string().min(1, "Email is required").email(),
    password:z.string().min(1,"Minimum 1 Chatacter"),
    userName:z.string().min(1,"At least 1 Character")
});

export type User=z.infer<typeof userZodSchema>;

export const postZodSchema=z.object({
    postTitle:z.string().min(10,"At Least 10 Character"),
    postContent:z.string().min(100,"At Least 100 Character"),
    postImages:z.array(z.string()).optional(),
    postLikes: z.array(z.string()).optional(),
    postComments:z.array(z.string()).optional(),
    postOwner:z.string(),
    postTags:z.array(z.string())
});

export type Post=z.infer<typeof postZodSchema>;

export const commentZodSchema=z.object({
    commentContent:z.string().min(100,"At Least 10 Character"),
    commentImages:z.array(z.string()).optional(),
    commentLikes: z.array(z.string()).optional(),
    commentOwner:z.string(),
});

export type comment=z.infer<typeof commentZodSchema>;