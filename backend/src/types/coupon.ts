export interface Coupon {
    id?: number;
    code: string;
    discount_percent: number;
    min_order_amount?: number | null;
    expires_at?: Date | null;
}

// Coupon validation response
export interface CouponValidation {
    valid: boolean;
    coupon?: Coupon;
    discount_amount?: number;
    message?: string;
}
