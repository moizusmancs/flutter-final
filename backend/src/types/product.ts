export interface Product {
    id?: number;
    name: string;
    description: string;
    category_id: number;
    price: number;
    discount: string;
    status: "draft" | "published" | "archived";
    created_at?: Date;
    updated_at?: Date;
}