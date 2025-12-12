import express from "express";
import {
    handleGetProfile,
    handleUpdateProfile,
    handleChangePassword
} from "../../controller/users/profile.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { updateProfileSchema, changePasswordSchema } from "../../zod/users/profile.zod.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/users/profile - Get user profile
router.get("/", handleGetProfile);

// PUT /api/v1/users/profile - Update profile (fullname and/or phone)
router.put("/", zodValidate(updateProfileSchema, "body"), handleUpdateProfile);

// PUT /api/v1/users/password - Change password
router.put("/password", zodValidate(changePasswordSchema, "body"), handleChangePassword);

export default router;
