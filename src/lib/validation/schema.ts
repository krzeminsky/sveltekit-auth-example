import { z } from "zod";

export const formSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).regex(/.*[0-9].*/g).max(255),
});