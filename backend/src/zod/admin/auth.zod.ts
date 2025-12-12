import { z } from 'zod';

// Schema for admin login
export const adminLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});
