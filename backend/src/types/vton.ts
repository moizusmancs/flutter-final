export interface UserImage {
    id?: number;
    user_id: number;
    image_url: string;
    s3_key: string;
    created_at?: Date;
}

export interface VtonGenerated {
    id?: number;
    user_id: number;
    user_image_id: number;
    product_id: number;
    generated_image_url: string;
    lightx_order_id?: string | null;
    segmentation_type: 0 | 1 | 2; // 0=upper, 1=lower, 2=full
    status: 'processing' | 'completed' | 'failed';
    created_at?: Date;
    updated_at?: Date;
}

// LightX API Types
export interface LightXUploadResponse {
    statusCode: number;
    message: string;
    body: {
        uploadImage: string;
        imageUrl: string;
        size: number;
    };
}

export interface LightXTryOnResponse {
    statusCode: number;
    message: string;
    body: {
        orderId: string;
        maxRetriesAllowed: number;
        avgResponseTimeInSec: number;
        status: 'init' | 'active' | 'failed';
    };
}

export interface LightXStatusResponse {
    statusCode: number;
    message: string;
    body: {
        orderId: string;
        status: 'init' | 'active' | 'failed';
        output?: string;
    };
}
