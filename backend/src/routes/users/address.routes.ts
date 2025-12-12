import express from "express";
import {
    handleGetUserAddresses,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress
} from "../../controller/users/address.controller.js";
import { zodValidate } from "../../middlewares/zodValidate.middleware.js";
import { createAddressSchema, updateAddressSchema, addressIdSchema } from "../../zod/users/address.zod.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/users/addresses - Get all user addresses
router.get("/", handleGetUserAddresses);

// POST /api/v1/users/addresses - Create new address
router.post("/", zodValidate(createAddressSchema, "body"), handleCreateAddress);

// PUT /api/v1/users/addresses/:id - Update address
router.put(
    "/:id",
    zodValidate(addressIdSchema, "params"),
    zodValidate(updateAddressSchema, "body"),
    handleUpdateAddress
);

// DELETE /api/v1/users/addresses/:id - Delete address
router.delete("/:id", zodValidate(addressIdSchema, "params"), handleDeleteAddress);

// PUT /api/v1/users/addresses/:id/default - Set as default address
router.put("/:id/default", zodValidate(addressIdSchema, "params"), handleSetDefaultAddress);

export default router;
