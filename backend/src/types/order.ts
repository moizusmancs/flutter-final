export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id?: number;
    user_id: number;
    total_amount: number;
    status: OrderStatus;
    payment_id?: number | null;
    shipping_address_id: number;
    created_at?: Date;
}

export interface OrderItem {
    id?: number;
    order_id: number;
    variant_id: number;
    quantity: number;
    price_at_purchase: number;
}

// Extended order with address and items details
export interface OrderWithDetails extends Order {
    // Address details
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;

    // Payment details
    payment_method?: string;
    payment_status?: string;
    transaction_reference?: string;
}

// Order item with product details
export interface OrderItemWithDetails extends OrderItem {
    // Product details
    product_id?: number;
    product_name?: string;
    product_description?: string;

    // Variant details
    size?: string;
    color?: string;

    // Media
    image_url?: string;
}
