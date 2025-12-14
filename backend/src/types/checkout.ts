export interface Address {
    id: number;
    user_id: number;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    address_id: number;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    payment_method: 'card' | 'cod';
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    stripe_payment_intent_id?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: Date;
}

export interface PaymentTransaction {
    id: number;
    order_id: number;
    transaction_id: string;
    payment_method: 'card' | 'cod';
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    stripe_payment_intent_id?: string;
    stripe_client_secret?: string;
    metadata?: any;
    created_at: Date;
    updated_at: Date;
}

export interface CheckoutItem {
    product_id: number;
    variant_id: number;
    quantity: number;
    size: string;
    color: string;
}

export interface CreateOrderRequest {
    address_id: number;
    items: CheckoutItem[];
    payment_method: 'card' | 'cod';
    notes?: string;
}

export interface OrderWithDetails extends Order {
    items: OrderItem[];
    address: Address;
}
