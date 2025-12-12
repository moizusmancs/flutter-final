export interface UserAddress {
    id?: number;
    user_id: number;
    line1: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    is_default: boolean;
}
