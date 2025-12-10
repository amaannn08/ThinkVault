import * as z from "zod";

export const userZodSchema=z.object({
    userId:z.string().min(1,"At least 1 Character"),
    password:z.string().min(1,"Minimum 1 Chatacter")
});

export type User=z.infer<typeof userZodSchema>;