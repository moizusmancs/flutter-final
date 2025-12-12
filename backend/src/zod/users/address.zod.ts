import { z } from 'zod';

// Schema for creating a new address
export const createAddressSchema = z.object({
    line1: z.string().min(5, "Address line must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    zip_code: z.string().regex(/^\d{5,6}$/, "ZIP code must be 5 or 6 digits"),
    is_default: z.boolean().optional().default(false)
});

// Schema for updating an address (all fields optional)
export const updateAddressSchema = createAddressSchema.partial();

// Schema for validating address ID in params
export const addressIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid address ID").transform(Number)
});
