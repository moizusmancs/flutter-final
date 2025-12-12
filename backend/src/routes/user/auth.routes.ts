import express from "express"
import { handleLoginUser, handleSignupUser, handleLogoutUser } from "../../controller/users/auth.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { loginSchema, signupSchema } from "../../zod/users/auth.zod.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";


const router = express.Router();
router.post("/signup", zodValidate(signupSchema, "body"), handleSignupUser);
router.post("/login", zodValidate(loginSchema, "body") , handleLoginUser);
router.post("/logout", authMiddleware, handleLogoutUser);


export default router;