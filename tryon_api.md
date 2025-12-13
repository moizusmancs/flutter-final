AI Virtual Outfit Try On
Access Our API Suite via GitHub: AI Virtual Outfit Try On

Overview
Welcome to the LightX AI Virtual Outfit Try-On API Documentation. This API allows you to visualize how you'd look in any outfit of your choice. Just upload your photo (input image) and a reference image featuring the outfit you like. The AI automatically and seamlessly transfers the clothing onto your image in seconds. It’s fast, realistic, and perfect for exploring new styles without physically trying anything on. Perfect for fashion, e-commerce, or personal styling.

AI Virtual Outfit Try On API Rollout
To access your AI virtual outfit try on, you need to generate an API key. Visit the LightX API to retrieve your key. Insert your image URL and style image to try the various outfits. Each generation will cost you 2 credit with the output delivered in JPEG format.

note
To ensure seamless processing, it is mandatory to use ImageUpload API for uploading images. External image URLs are not supported and will result in an error. The minimum required image size is 512x512 pixels.

Step 1
Image Upload API

API v2 Image Upload delivers secure, high-performance image hosting, enabling users to effortlessly generate and manage image URLs. With advanced security measures, optimized processing speed, and seamless integration, it ensures faster, more reliable uploads. Designed for scalability and ease of use, it simplifies image management for developers, e-commerce platforms, and creative applications.

Here are the steps

Choose the preferred parameter for image generation. Insert the size of the image for which you want to generate a URL. Ensure the image size does not exceed 5 MB or 5,242,880 bytes. Finally, choose the file format for the image, either JPEG or PNG. With the imageUrl, you can generate the URL for your image, the reference image, and the masked image.

Below are the steps to make this process clearer and easier.

cURL
Python
JavaScript
Swift
Kotlin
curl --location 'https://api.lightxeditor.com/external/api/v2/uploadImageUrl' \
--header 'Content-Type: application/json' \
--header 'x-api-key: <enter x-api-key>' \
--data '{
  "uploadType": "imageUrl", 
  "size": 791436,   // Image Size in Bytes
  "contentType": "image/jpeg"   // Image File Format
}'

Response
{
   "statusCode": 2000,
   "message": "SUCCESS",
   "body": {
       "uploadImage": "https://lightx-ai-version-2.s3-accelerate.amazonaws.com/apikey/35b4895058344d109ea8ad059be61d2d.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250127T044301Z&X-Amz-SignedHeaders=content-length%3Bcontent-type%3Bhost&X-Amz-Expires=3599&X-Amz-Credential=AKIA2Y6AHIB47OUAEN64%2F20250127%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=fce9526cb5c8ff129d7e47a21f26955dd3215b0d42e58ce52626f4e66b694384",
       "imageUrl": "https://d3aa3s3yhl0emm.cloudfront.net/apikey/35b4895058344d109ea8ad059be61d2d.jpeg",
       "size": 791436
   }
}


As you can see above, in the response you have uploadImage and ImageURL. uploadImage url will be used to make a Put request, whereas the imageUrl is the final image url which don't have image uploaded rightnow. To upload a image follow the next process.

Next, use the uploadImage URL obtained from the https://api.lightxeditor.com/external/api/v2/uploadImageUrl API to upload your image. To make your imageUrl valid, use a PUT request to the uploadImage URL. Ensure that the request includes the image file in the correct format while maintaining the required image size. The image should be the same as the one used for uploading image size.

Step 1.1
Process to make a PUT request with your image using the uploadImage URL.

cURL
Python
JavaScript
Swift
Kotlin

curl --location --request PUT 'https://lightx-ai-version-2.s3-accelerate.amazonaws.com/apikey/36f83a00fcd74180acfda42293455843.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250127T050022Z&X-Amz-SignedHeaders=content-length%3Bcontent-type%3Bhost&X-Amz-Expires=3599&X-Amz-Credential=AKIA2Y6AHIB47OUAEN64%2F20250127%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=093760f15d8302c424823ad671a973ce984cc7ab2f71265ae767afcdf99ef08f' \
--header 'Content-Type: image/jpeg' \
--data-binary '@/C:/Users/Downloads/wow.jpg'


Once the image is uploaded, you will receive an HTTP 200 OK status, indicating that the upload was successful. You can now access the imageUrl obtained from the https://api.lightxeditor.com/external/api/v2/uploadImageUrl API.

note
For security and user data safety, the API-generated image URLs remain valid for 24 hours, without consuming any credits or incurring API usage charges, after which the URLs automatically expire.

Step 2
Lets use url to try on outfits

Going Forward, use cURL along with x-api-key and your API key (as given below) to try outfits virtually with AI. Next, proceed to the "Body" tab to configure the request payload according to the required format and input data as required. Finally, click "Send" to submit the request.

note
The segmentationType parameter defines which part of the body the AI Virtual Try-On API will process.

0 → Upper Body
Apply outfit changes only to the upper body region (e.g., shirts, jackets, tops).

1 → Lower Body
Apply outfit changes only to the lower body region (e.g., trousers, skirts).

2 → Full Body
Apply outfit changes to the full body (complete outfit replacement).

cURL
Python
JavaScript
Swift
Kotlin
  Method- Post
curl --location 'https://api.lightxeditor.com/external/api/v2/aivirtualtryon' \
--header 'Content-Type: application/json' \
--header 'x-api-key: <Insert your API Key>' \

--data '{
"imageUrl": "https://example.com/your-image.jpg",  // Replace with the URL of your input image
"outfitImageUrl": "https://example.com/your-style-image.jpg"  // Replace with the URL of your outfit style image
"segmentationType": 0                  //        0 for Upper Body, 1 for Lower body, 2 for Full body            
}'


Once your request is completed, visualize the "Response" to verify that the API call is executed successfully (as given below).

Response
{
   "statusCode": 2000,
   "message": "SUCCESS",
   "body": {
       "orderId": "7906da5353b504162db5199d6",
       "maxRetriesAllowed": 5,
       "avgResponseTimeInSec": 15,
       "status": "init"
   }
}

orderId: This key is the unique identifier for the order.
maxRetriesAllowed: The number of retries a user can attempt when the status is "init".
avgResponseTimeInSec: This is the average time the machine can take to generate the output.
status: There are three scenarios: "init" = proccessing, "failed" = error.

Once your order Id is generated, input it into the status check system to retrieve and review the results of your API Tool (mentioned below).

Step 2.1
Check Status

cURL
Python
JavaScript
Swift
Kotlin
curl --location --request POST 'https://api.lightxeditor.com/external/api/v2/order-status' \
--header 'Content-Type: application/json' \
--header 'x-api-key: <Insert your API Key>' \
--data '{
"orderId": "insert your Order ID"
}'

After hitting orderId as request payload in your check status make sure you make a subsequent API call which means, in every 3 seconds you can hit until you get "status": "active"

note
The maximum time for receiving output is 15 seconds. You are allowed up to 5 retries for checking the status, with each API call being made every 3 seconds. You need to repeatedly call this API up to 5 times until you receive a status of as active/failed. In case of failed status, no credit will be deducted. When the status is "active," the relevant output will be included in the output attribute of the response.

Output
{
   "statusCode": 2000,
   "message": "SUCCESS",
   "body": {
       "orderId": "7906da5353b504162db5199d6",
       "status": "active",
       "output": "https://example.com/your-outputimage.jpg"
   }
}

Previous
AI Hair Color
