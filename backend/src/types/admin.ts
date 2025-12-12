export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface Admin {
    id?: number;
    username: string;
    email: string;
    password_hash?: string;
    role: AdminRole;
    created_at?: Date;
}

// Admin info for JWT and responses (without sensitive data)
export interface AdminInfo {
    id: number;
    username: string;
    email: string;
    role: AdminRole;
}
