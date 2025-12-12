import { Router } from 'express';
import {
    handleGetOrders,
    handleGetOrderDetails,
    handleCreateOrder,
    handleCancelOrder
} from '../../controller/users/order.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { zodValidate } from '../../middlewares/zodValidate.middleware.js';
import {
    createOrderSchema,
    orderIdSchema
} from '../../zod/users/order.zod.js';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

// GET /orders - Get user's order history
router.get('/', handleGetOrders);

// GET /orders/:id - Get specific order details
router.get('/:id',
    zodValidate(orderIdSchema, 'params'),
    handleGetOrderDetails
);

// POST /orders - Create new order
router.post('/',
    zodValidate(createOrderSchema, 'body'),
    handleCreateOrder
);

// PUT /orders/:id/cancel - Cancel order
router.put('/:id/cancel',
    zodValidate(orderIdSchema, 'params'),
    handleCancelOrder
);

export default router;
