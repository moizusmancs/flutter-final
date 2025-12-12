import { z } from 'zod';

// Schema for updating profile (fullname and phone)
export const updateProfileSchema = z.object({
    fullname: z.string().min(3, "Full name must be at least 3 characters long").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits long").optional()
}).refine(
    (data) => data.fullname !== undefined || data.phone !== undefined,
    {
        message: "At least one field (fullname or phone) must be provided"
    }
);

// Schema for changing password
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters long"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long")
}).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
        message: "New password must be different from current password",
        path: ["newPassword"]
    }
);
