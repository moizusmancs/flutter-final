import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandlerMiddleware from './middlewares/globalErrorHandler.middleware.js';
import userAuthRoutes from './routes/user/auth.routes.js';
import userProfileRoutes from './routes/users/profile.routes.js';
import userAddressRoutes from './routes/users/address.routes.js';
import userWishlistRoutes from './routes/users/wishlist.routes.js';
import userCartRoutes from './routes/users/cart.routes.js';
import userOrderRoutes from './routes/users/order.routes.js';
import userPaymentRoutes from './routes/users/payment.routes.js';
import userCouponRoutes from './routes/users/coupon.routes.js';
import userVtonRoutes from './routes/users/vton.routes.js';
import productRoutes from './routes/products/product.routes.js';
import categoryRoutes from './routes/categories/category.routes.js';
import adminAuthRoutes from './routes/admin/auth.routes.js';
import categoryAdminRoutes from './routes/admin/category/category.admin.routes.js';
import mediaAdminRoutes from './routes/admin/media/media.routes.js';
import productAdminRoutes from './routes/admin/products/product.admin.routes.js';
import orderAdminRoutes from './routes/admin/orders/order.admin.routes.js';
import userAdminRoutes from './routes/admin/users/user.admin.routes.js';
import couponAdminRoutes from './routes/admin/coupons/coupon.admin.routes.js';
import analyticsAdminRoutes from './routes/admin/analytics/analytics.admin.routes.js';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// User routes
app.use("/api/v1/users/auth", userAuthRoutes);
app.use("/api/v1/users/profile", userProfileRoutes);
app.use("/api/v1/users/addresses", userAddressRoutes);
app.use("/api/v1/users/wishlist", userWishlistRoutes);
app.use("/api/v1/users/cart", userCartRoutes);
app.use("/api/v1/users/orders", userOrderRoutes);
app.use("/api/v1/users/payments", userPaymentRoutes);
app.use("/api/v1/users/coupons", userCouponRoutes);
app.use("/api/v1/users/vton", userVtonRoutes);

// Public routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Admin routes
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/categories", categoryAdminRoutes);
app.use("/api/v1/admin/media",  mediaAdminRoutes);
app.use("/api/v1/admin/products", productAdminRoutes);
app.use("/api/v1/admin/orders", orderAdminRoutes);
app.use("/api/v1/admin/users", userAdminRoutes);
app.use("/api/v1/admin/coupons", couponAdminRoutes);
app.use("/api/v1/admin/analytics", analyticsAdminRoutes);


app.get("/test",(req:Request, res:Response, next: NextFunction) => {
    res.json({success:true})
})

app.use(globalErrorHandlerMiddleware)

app.listen(4000, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
},);
