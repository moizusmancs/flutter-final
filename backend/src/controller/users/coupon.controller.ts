import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Coupon } from "../../types/coupon.js";

// POST /coupons/validate - Validate coupon code
export const handleValidateCoupon = AsyncCall(async (req, res, next) => {
    const userId = req.user!.id;
    const { code, order_amount } = req.body;

    // Get coupon by code
    const coupons = await queryDb<Coupon[]>(
        "SELECT id, code, discount_percent, min_order_amount, expires_at FROM coupons WHERE code = ?",
        [code.toUpperCase()]
    );

    if (coupons.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Invalid coupon code",
            valid: false
        });
    }

    const coupon = coupons[0];

    // Check if coupon has expired
    if (coupon.expires_at) {
        const expiryDate = new Date(coupon.expires_at);
        const now = new Date();

        if (expiryDate < now) {
            return res.status(400).json({
                success: false,
                message: "Coupon has expired",
                valid: false
            });
        }
    }

    // Check minimum order amount
    if (coupon.min_order_amount && order_amount < coupon.min_order_amount) {
        return res.status(400).json({
            success: false,
            message: `Minimum order amount of ${coupon.min_order_amount} required`,
            valid: false,
            min_order_amount: coupon.min_order_amount
        });
    }

    // Calculate discount amount
    const discountAmount = (order_amount * coupon.discount_percent) / 100;
    const finalAmount = order_amount - discountAmount;

    res.status(200).json({
        success: true,
        message: "Coupon is valid",
        valid: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            discount_percent: coupon.discount_percent,
            min_order_amount: coupon.min_order_amount,
            expires_at: coupon.expires_at
        },
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        final_amount: parseFloat(finalAmount.toFixed(2))
    });
});

// GET /coupons/active - Get all active coupons
export const handleGetActiveCoupons = AsyncCall(async (req, res, next) => {
    // Get all coupons that haven't expired or have no expiry date
    const coupons = await queryDb<Coupon[]>(`
        SELECT
            id,
            code,
            discount_percent,
            min_order_amount,
            expires_at
        FROM coupons
        WHERE expires_at IS NULL OR expires_at > NOW()
        ORDER BY discount_percent DESC
    `);

    res.status(200).json({
        success: true,
        message: "Active coupons fetched successfully",
        coupons,
        count: coupons.length
    });
});
