import * as z from "zod";

export const userSignupZodSchema=z.object({
    firstName:z.string().min(1,"At Least 1 Character"),
    lastName:z.string().min(1,"At Least 1 Character").optional(),
    email: z.string().min(1, "Email is required").email(),
    password:z.string().min(1,"Minimum 1 Chatacter"),
    userName:z.string().min(1,"At least 1 Character")
});

export type UserSignup=z.infer<typeof userSignupZodSchema>;

export const userSigninZodSchema=z.object({
    userName:z.string().min(1,"At least 1 Character"),
    password:z.string().min(1,"Minimum 1 Chatacter")
})

export type UserSignin=z.infer<typeof userSigninZodSchema>;

export const userSearchZodSchema=z.object({
    userName:z.string().min(1,"At least 1 Character")
})

export type UserSearch=z.infer<typeof userSearchZodSchema>;

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