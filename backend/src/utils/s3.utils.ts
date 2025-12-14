import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { AsyncCall } from "../middlewares/asyncCall.middleware.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Config } from "../config/aws.js";


export const generatePresignedUrls = async (fileName:string, bucketType: 'default' | 'vton' = 'default') => {

    if(!fileName){
        throw new Error("fileName must be non-empty");
    }

    const key = `${fileName}-${Date.now()}`;

    // Use different bucket for VTON images
    const bucketName = bucketType === 'vton'
        ? (process.env.AWS_VTON_BUCKET_NAME || process.env.AWS_BUCKET_NAME!)
        : process.env.AWS_BUCKET_NAME!;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(s3Config, command, { expiresIn: 300 }); // 5 mins
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
    uploadUrl,
    fileUrl,
    key
    };

}

// Generate presigned URL for reading/downloading from S3
export const generatePresignedDownloadUrl = async (s3Key: string, bucketType: 'default' | 'vton' = 'default') => {
    const bucketName = bucketType === 'vton'
        ? (process.env.AWS_VTON_BUCKET_NAME || process.env.AWS_BUCKET_NAME!)
        : process.env.AWS_BUCKET_NAME!;

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(s3Config, command, { expiresIn: 600 }); // 10 mins

    return downloadUrl;
}