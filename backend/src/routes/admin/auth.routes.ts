import { Router } from 'express';
import {
    handleAdminLogin,
    handleAdminLogout,
    handleCheckAuth
} from '../../controller/admin/auth.controller.js';
import { adminAuthMiddleware } from '../../middlewares/adminAuth.middleware.js';
import { zodValidate } from '../../middlewares/zodValidate.middleware.js';
import { adminLoginSchema } from '../../zod/admin/auth.zod.js';

const router = Router();

// POST /admin/auth/login - Admin login (public)
router.post('/login',
    zodValidate(adminLoginSchema, 'body'),
    handleAdminLogin
);

// POST /admin/auth/logout - Admin logout (requires admin auth)
router.post('/logout',
    adminAuthMiddleware,
    handleAdminLogout
);

// GET /admin/auth/check - Check if admin is authenticated
router.get('/check',
    adminAuthMiddleware,
    handleCheckAuth
);

export default router;
