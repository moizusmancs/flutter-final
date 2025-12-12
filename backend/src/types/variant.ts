export interface ProductVariant {
    id?: number;
    product_id: number;
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    color: string;
    stock: number;
    additional_price: number;
}

// Extended variant with product details (for cart/wishlist joins)
export interface ProductVariantWithDetails extends ProductVariant {
    product_name?: string;
    product_price?: number;
    product_discount?: number;
    image_url?: string;
}
