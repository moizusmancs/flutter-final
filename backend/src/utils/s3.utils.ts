import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AsyncCall } from "../middlewares/asyncCall.middleware.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Config } from "../config/aws.js";


export const generatePresignedUrls = async (fileName:string) => {

    if(!fileName){
        throw new Error("fileName must be non-empty");
    }

    const key = `${fileName} - ${Date.now()}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(s3Config, command, { expiresIn: 300 }); // 5 mins
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
    uploadUrl,
    fileUrl,
    key
    };

}