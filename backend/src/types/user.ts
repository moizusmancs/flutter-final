export interface User {
    id?: number;
    fullname: string;
    email: string;
    password_hash: string;
    phone: string;
    created_at?: Date;
    updated_at?: Date;
}