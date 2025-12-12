import { Router } from 'express';
import {
    handleGetCart,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveFromCart,
    handleClearCart
} from '../../controller/users/cart.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { zodValidate } from '../../middlewares/zodValidate.middleware.js';
import {
    addToCartSchema,
    updateCartItemSchema,
    cartIdSchema
} from '../../zod/users/cart.zod.js';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

// GET /cart - Get user's cart
router.get('/', handleGetCart);

// POST /cart - Add item to cart
router.post('/', zodValidate(addToCartSchema, 'body'), handleAddToCart);

// DELETE /cart/clear - Clear entire cart (must be before /:id)
router.delete('/clear', handleClearCart);

// PUT /cart/:id - Update cart item quantity
router.put('/:id',
    zodValidate(cartIdSchema, 'params'),
    zodValidate(updateCartItemSchema, 'body'),
    handleUpdateCartItem
);

// DELETE /cart/:id - Remove item from cart
router.delete('/:id',
    zodValidate(cartIdSchema, 'params'),
    handleRemoveFromCart
);

export default router;
