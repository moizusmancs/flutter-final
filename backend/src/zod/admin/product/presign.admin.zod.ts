import { z } from "zod";

export const presignQuerySchema = z.object({
    fileName: z
        .string("File name must be a string")
        .min(1, "File name is required")
        .max(255, "File name is too long")
        .regex(/^[^\/\\]+\.jpe?g$/i, "fileName must be a .jpg or .jpeg and cannot contain path separators"),
});