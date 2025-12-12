import { AsyncCall } from "../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../utils/queryDb.js";
import CustomError from "../../utils/customError.js";
import { Product } from "../../types/product.js";
import { ProductVariant } from "../../types/variant.js";

// GET /products - Get all products with optional filters
export const handleGetAllProducts = AsyncCall(async (req, res, next) => {
    const { page, limit, sort, category_id, min_price, max_price } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];

    if (category_id) {
        conditions.push("category_id = ?");
        values.push(category_id);
    }

    if (min_price) {
        conditions.push("price >= ?");
        values.push(min_price);
    }

    if (max_price) {
        conditions.push("price <= ?");
        values.push(max_price);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = sort === "asc" ? "ASC" : "DESC";

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countResult = await queryDb<{ total: number }[]>(countQuery, values);
    const total = countResult[0].total;

    // Get products
    const query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.created_at ${orderBy}
        LIMIT ? OFFSET ?
    `;

    const products = await queryDb<Product[]>(query, [...values, limitNum, offset]);

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
});

// GET /products/one/:id - Get single product
export const handleGetOneProduct = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    const products = await queryDb<Product[]>(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product: products[0]
    });
});

// GET /products/:id/variants - Get all variants for a product
export const handleGetProductVariants = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // Get variants
    const variants = await queryDb<ProductVariant[]>(
        "SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Product variants fetched successfully",
        variants
    });
});

// GET /products/search - Search products
export const handleSearchProducts = AsyncCall(async (req, res, next) => {
    const { q, category_id, min_price, max_price, page, limit } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build search query
    const conditions: string[] = ["(p.name LIKE ? OR p.description LIKE ?)"];
    const values: any[] = [`%${q}%`, `%${q}%`];

    if (category_id) {
        conditions.push("p.category_id = ?");
        values.push(category_id);
    }

    if (min_price) {
        conditions.push("p.price >= ?");
        values.push(min_price);
    }

    if (max_price) {
        conditions.push("p.price <= ?");
        values.push(max_price);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const countResult = await queryDb<{ total: number }[]>(countQuery, values);
    const total = countResult[0].total;

    // Get products
    const query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const products = await queryDb<Product[]>(query, [...values, limitNum, offset]);

    res.status(200).json({
        success: true,
        message: "Products search completed successfully",
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
});

// GET /products/category/:id - Get products by category
export const handleGetProductsByCategory = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { page, limit, sort } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const orderBy = sort === "asc" ? "ASC" : "DESC";

    // Check if category exists
    const categories = await queryDb<{ id: number }[]>(
        "SELECT id FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    // Get total count
    const countResult = await queryDb<{ total: number }[]>(
        "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
        [id]
    );
    const total = countResult[0].total;

    // Get products
    const products = await queryDb<Product[]>(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = ?
         ORDER BY p.created_at ${orderBy}
         LIMIT ? OFFSET ?`,
        [id, limitNum, offset]
    );

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    });
});


