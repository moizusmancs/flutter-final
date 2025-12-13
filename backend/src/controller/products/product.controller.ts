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

    const products = await queryDb<any[]>(query, [...values, limitNum, offset]);

    // Fetch images for each product
    for (const product of products) {
        const media = await queryDb<{ url: string }[]>(
            "SELECT url FROM product_media WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
            [product.id]
        );
        product.images = media.map(m => m.url);
    }

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

    const products = await queryDb<any[]>(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    const product = products[0];

    // Fetch images
    const media = await queryDb<{ url: string }[]>(
        "SELECT url FROM product_media WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
        [id]
    );
    product.images = media.map(m => m.url);

    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product
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

    const products = await queryDb<any[]>(query, [...values, limitNum, offset]);

    // Fetch images for each product
    for (const product of products) {
        const media = await queryDb<{ url: string }[]>(
            "SELECT url FROM product_media WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
            [product.id]
        );
        product.images = media.map(m => m.url);
    }

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

    // Handle different sort options
    let orderByClause = "p.created_at DESC"; // default: latest
    if (sort === "asc") {
        orderByClause = "p.created_at ASC";
    } else if (sort === "price_asc") {
        orderByClause = "p.price ASC";
    } else if (sort === "price_desc") {
        orderByClause = "p.price DESC";
    }

    // Check if category exists
    const categories = await queryDb<{ id: number }[]>(
        "SELECT id FROM categories WHERE id = ?",
        [id]
    );

    if (categories.length === 0) {
        return next(new CustomError("Category not found", 404));
    }

    // Get all subcategory IDs (including the category itself)
    const subcategories = await queryDb<{ id: number }[]>(
        "SELECT id FROM categories WHERE id = ? OR parent_id = ?",
        [id, id]
    );
    const categoryIds = subcategories.map(c => c.id);

    // Build WHERE clause for multiple categories
    const placeholders = categoryIds.map(() => '?').join(',');

    // Get total count
    const countResult = await queryDb<{ total: number }[]>(
        `SELECT COUNT(*) as total FROM products WHERE category_id IN (${placeholders})`,
        categoryIds
    );
    const total = countResult[0].total;

    // Get products
    const products = await queryDb<any[]>(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id IN (${placeholders})
         ORDER BY ${orderByClause}
         LIMIT ? OFFSET ?`,
        [...categoryIds, limitNum, offset]
    );

    // Fetch images for each product
    for (const product of products) {
        const media = await queryDb<{ url: string }[]>(
            "SELECT url FROM product_media WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
            [product.id]
        );
        product.images = media.map(m => m.url);
    }

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


