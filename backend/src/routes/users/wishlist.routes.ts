import express from "express";
import {
    handleGetWishlist,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    handleClearWishlist
} from "../../controller/users/wishlist.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { addToWishlistSchema, wishlistIdSchema } from "../../zod/users/wishlist.zod.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/users/wishlist - Get user's wishlist
router.get("/", handleGetWishlist);

// POST /api/v1/users/wishlist - Add item to wishlist
router.post("/", zodValidate(addToWishlistSchema, "body"), handleAddToWishlist);

// DELETE /api/v1/users/wishlist/clear - Clear entire wishlist (must be before /:id)
router.delete("/clear", handleClearWishlist);

// DELETE /api/v1/users/wishlist/:id - Remove item from wishlist
router.delete("/:id", zodValidate(wishlistIdSchema, "params"), handleRemoveFromWishlist);

export default router;
