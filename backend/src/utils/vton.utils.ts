import axios from 'axios';
import { LightXUploadResponse, LightXTryOnResponse, LightXStatusResponse } from '../types/vton.js';

const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY || '';
const LIGHTX_BASE_URL = 'https://api.lightxeditor.com/external/api/v2';

/**
 * Step 1: Get upload URL from LightX
 */
export async function getLightXUploadUrl(imageSize: number, contentType: string = 'image/jpeg'): Promise<LightXUploadResponse> {
    try {
        const response = await axios.post<LightXUploadResponse>(
            `${LIGHTX_BASE_URL}/uploadImageUrl`,
            {
                uploadType: 'imageUrl',
                size: imageSize,
                contentType: contentType
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': LIGHTX_API_KEY
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error getting LightX upload URL:', error.response?.data || error.message);
        throw new Error('Failed to get upload URL from LightX');
    }
}

/**
 * Step 2: Upload image to LightX S3 using presigned URL
 */
export async function uploadImageToLightX(uploadUrl: string, imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<void> {
    try {
        await axios.put(uploadUrl, imageBuffer, {
            headers: {
                'Content-Type': contentType
            }
        });
    } catch (error: any) {
        console.error('Error uploading to LightX:', error.message);
        throw new Error('Failed to upload image to LightX');
    }
}

/**
 * Step 3: Initiate Virtual Try-On
 */
export async function initiateLightXTryOn(
    userImageUrl: string,
    outfitImageUrl: string,
    segmentationType: 0 | 1 | 2 = 0
): Promise<LightXTryOnResponse> {
    try {
        console.log(`Initiating VTON with user image: ${userImageUrl.substring(0, 50)}...`);
        console.log(`Outfit image: ${outfitImageUrl.substring(0, 50)}...`);
        console.log(`Segmentation type: ${segmentationType}`);

        const response = await axios.post<LightXTryOnResponse>(
            `${LIGHTX_BASE_URL}/aivirtualtryon`,
            {
                imageUrl: userImageUrl,
                outfitImageUrl: outfitImageUrl,
                segmentationType: segmentationType
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': LIGHTX_API_KEY
                }
            }
        );

        console.log(`LightX response:`, JSON.stringify(response.data));
        return response.data;
    } catch (error: any) {
        console.error('Error initiating LightX try-on:', error.response?.data || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw new Error('Failed to initiate virtual try-on');
    }
}

/**
 * Step 4: Check status of Virtual Try-On
 */
export async function checkLightXStatus(orderId: string): Promise<LightXStatusResponse> {
    try {
        const response = await axios.post<LightXStatusResponse>(
            `${LIGHTX_BASE_URL}/order-status`,
            {
                orderId: orderId
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': LIGHTX_API_KEY
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error checking LightX status:', error.response?.data || error.message);
        throw new Error('Failed to check virtual try-on status');
    }
}

/**
 * Poll for VTON result - waits up to 60 seconds
 */
export async function pollForVtonResult(orderId: string): Promise<string> {
    const maxRetries = 20;
    const intervalMs = 3000;

    console.log(`Polling for order ${orderId} (max ${maxRetries * intervalMs / 1000}s)`);

    for (let i = 0; i < maxRetries; i++) {
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        console.log(`Check ${i + 1}/${maxRetries}...`);

        try {
            const statusResponse = await checkLightXStatus(orderId);

            if (statusResponse.body.status === 'active' && statusResponse.body.output) {
                console.log(`SUCCESS! URL: ${statusResponse.body.output}`);
                return statusResponse.body.output;
            }

            if (statusResponse.body.status === 'failed') {
                throw new Error('LightX reported generation failed');
            }

            console.log(`Status: ${statusResponse.body.status}`);
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
        }
    }

    throw new Error('Timeout after 60 seconds');
}
