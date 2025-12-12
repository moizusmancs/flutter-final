export interface Wishlist {
    id?: number;
    user_id: number;
    variant_id: number;
    created_at?: Date;
}

// Extended wishlist item with product details (for display)
export interface WishlistItemWithDetails extends Wishlist {
    // Product variant details
    size?: string;
    color?: string;
    stock?: number;
    additional_price?: number;

    // Product details
    product_id?: number;
    product_name?: string;
    product_price?: number;
    product_discount?: number;
    product_description?: string;

    // Media
    image_url?: string;

    // Category
    category_name?: string;
}
