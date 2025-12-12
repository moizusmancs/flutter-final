export type PaymentMethod = 'card' | 'cod' | 'upi' | 'net_banking';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
    id?: number;
    order_id: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transaction_reference?: string | null;
    paid_at?: Date | null;
}

// Stripe payment intent response
export interface StripePaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
}
