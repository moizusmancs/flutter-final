export interface User {
    id?: number;
    fullname: string;
    email: string;
    hashed_password: string;
    phone: string;
    created_at?: Date;
    updated_at?: Date;
}