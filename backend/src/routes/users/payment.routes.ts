import { Router } from 'express';
import {
    handleInitiatePayment,
    handleVerifyPayment,
    handleGetPaymentStatus
} from '../../controller/users/payment.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { zodValidate } from '../../middlewares/zodValidate.middleware.js';
import {
    initiatePaymentSchema,
    verifyPaymentSchema,
    paymentOrderIdSchema
} from '../../zod/users/payment.zod.js';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

// POST /payments/initiate - Initiate payment
router.post('/initiate',
    zodValidate(initiatePaymentSchema, 'body'),
    handleInitiatePayment
);

// POST /payments/verify - Verify payment
router.post('/verify',
    zodValidate(verifyPaymentSchema, 'body'),
    handleVerifyPayment
);

// GET /payments/:order_id - Get payment status
router.get('/:order_id',
    zodValidate(paymentOrderIdSchema, 'params'),
    handleGetPaymentStatus
);

export default router;
