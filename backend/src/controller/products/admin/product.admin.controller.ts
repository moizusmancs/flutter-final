import { NextFunction, Request, Response } from "express";
import { AsyncCall } from "../../../middlewares/asyncCall.middleware.js";
import { queryDb } from "../../../utils/queryDb.js";
import { ResultSetHeader } from "mysql2";
import { Product } from "../../../types/product.js";
import CustomError from "../../../utils/customError.js";
import { Category } from "../../../types/category.js";
import { ProductVariant } from "../../../types/variant.js";
import { ProductMedia } from "../../../types/productMedia.js";

// GET /admin/products - Get all products
export const handleGetAllProducts = AsyncCall(async (req, res, _next) => {
    const { status, category_id, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.category_id,
            p.price,
            p.discount,
            p.created_at,
            c.name as category_name,
            'active' as status,
            CONCAT('SKU-', p.id) as sku
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (search) {
        conditions.push("p.name LIKE ?");
        values.push(`%${search}%`);
    }

    if (status) {
        // Since we don't have status column, ignore this filter for now
    }

    if (category_id) {
        conditions.push("p.category_id = ?");
        values.push(Number(category_id));
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`;
    const countResult = await queryDb<{ total: number }[]>(countQuery, values);
    const total = countResult[0].total;

    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    values.push(limitNum, offset);

    const products = await queryDb<Product[]>(query, values);

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

// GET /admin/products/:id - Get product details
export const handleGetProductDetails = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    const products = await queryDb<Product[]>(
        "SELECT id, name, description, category_id, price, discount, status, created_at, updated_at FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // Get variants for this product
    const variants = await queryDb<ProductVariant[]>(
        "SELECT id, product_id, size, color, stock, additional_price FROM product_variants WHERE product_id = ? ORDER BY id ASC",
        [id]
    );

    // Get media for this product
    const media = await queryDb<ProductMedia[]>(
        "SELECT id, product_id, url, is_primary FROM product_media WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
        [id]
    );

    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product: products[0],
        variants,
        media
    });
});

// POST /admin/products/new - Create new product
export const handleCreateNewProduct = AsyncCall(
    async (req: Request, res: Response, next: NextFunction) => {

        const product = await queryDb<ResultSetHeader>(
            "INSERT INTO products (name, price, status) VALUES (?, ?, ?)",
            ['New Product', 0, 'draft']
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: product.insertId
        });

    }
)

export const handleUpdateProductMetaData = AsyncCall(
    async (req: Request, res: Response, next: NextFunction) => {

        const { productId, name, description, price, categoryId, discount, status } = req.body;

        const checkProductExists = await queryDb("SELECT * FROM products WHERE id = ?", [productId]) as Product[];
        
        if(checkProductExists.length === 0){
            return next(new CustomError(`No such product exists with id ${productId}`, 400));
        }

        const foundProduct = checkProductExists[0];

        // product object dynamically update
        const updateProductObject: Record<string, any> = {};   
        if (name !== undefined) updateProductObject.name = name;
        if (description !== undefined) updateProductObject.description = description;
        if (price !== undefined) updateProductObject.price = price;
        if (categoryId !== undefined){

            if(categoryId !== null){
                const categoryExists = await queryDb("SELECT * FROM categories WHERE id = ?", [categoryId]) as Category[];
            
                if (categoryExists.length == 0) {
                    return next(new CustomError(`No Category with id ${categoryId} exists.`, 400));
                }
            }

            updateProductObject.category_id = categoryId;
        }
        if (discount !== undefined) updateProductObject.discount = discount;

        // no values provided for update
        if (Object.keys(updateProductObject).length === 0) {
            return next(new CustomError("No fields provided to update", 400));
        }

        const hasNulls = Object.values(updateProductObject).some(value => value === null);

        // if product is published/archived and any new value is NULL, mark as draft
        if(hasNulls && (foundProduct.status === "published" || foundProduct.status === "archived")){
            updateProductObject.status = "draft";
        }

        if (status === "published" || status === "archived") {
            // Check all mandatory fields exist (both DB + updates combined)
            const finalProduct = { ...foundProduct, ...updateProductObject };
      
            const missingFields = [];
            if (!finalProduct.name) missingFields.push("name");
            if (!finalProduct.description) missingFields.push("description");
            if (finalProduct.price == null) missingFields.push("price");
            if (finalProduct.category_id == null) missingFields.push("category_id");
      
            if (missingFields.length > 0) {
              return next(
                new CustomError(
                  `Cannot ${status} product. Missing required fields: ${missingFields.join(", ")}`,
                  400
                )
              );
            }
      
            // Data is complete, allow status change
            updateProductObject.status = status;
          }

        // output --> [1] name = ?, description = ?, price = ?
        const setClause = Object.keys(updateProductObject)
        .map(field => `${field} = ?`)
        .join(", ");
        
        // output --> [1] [ 'new produc', 'asdsasddsadd', 12 ]
        const values = Object.values(updateProductObject);

        const updateQuery = `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = ?`;

        await queryDb(updateQuery, [...values, productId]);

        const updated = (await queryDb("SELECT * FROM products WHERE id = ?", [productId])) as Product[];

        res.json({
            success: true,
            message: "Product updated successfully",
            product: updated[0]
        })

    }
);

// DELETE /admin/products/:id - Delete product
export const handleDeleteProduct = AsyncCall(async (req, res, next) => {
    const { id } = req.params;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    // Check if product has variants
    const variants = await queryDb<{ id: number }[]>(
        "SELECT id FROM product_variants WHERE product_id = ?",
        [id]
    );

    if (variants.length > 0) {
        return next(new CustomError("Cannot delete product with variants. Delete variants first.", 400));
    }

    // Delete product (CASCADE will handle product_media)
    const result = await queryDb<ResultSetHeader>(
        "DELETE FROM products WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to delete product", 500));
    }

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
});

// PUT /admin/products/:id/status - Update product status
export const handleUpdateProductStatus = AsyncCall(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    // Check if product exists
    const products = await queryDb<Product[]>(
        "SELECT id, name, description, price, category_id FROM products WHERE id = ?",
        [id]
    );

    if (products.length === 0) {
        return next(new CustomError("Product not found", 404));
    }

    const product = products[0];

    // If status is published or archived, validate required fields
    if (status === "published" || status === "archived") {
        const missingFields = [];
        if (!product.name) missingFields.push("name");
        if (!product.description) missingFields.push("description");
        if (product.price == null) missingFields.push("price");
        if (product.category_id == null) missingFields.push("category_id");

        if (missingFields.length > 0) {
            return next(
                new CustomError(
                    `Cannot ${status} product. Missing required fields: ${missingFields.join(", ")}`,
                    400
                )
            );
        }
    }

    // Update status
    const result = await queryDb<ResultSetHeader>(
        "UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, id]
    );

    if (result.affectedRows === 0) {
        return next(new CustomError("Failed to update product status", 500));
    }

    res.status(200).json({
        success: true,
        message: `Product status updated to ${status}`,
        product: {
            id: Number(id),
            status
        }
    });
});