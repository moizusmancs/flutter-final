# Product Create/Edit Module - Complete Implementation Plan

## Current Status Analysis

### ✅ What's Already Implemented:
1. **Basic Product Creation Flow**
   - Create empty product: `POST /admin/products/new`
   - Update product metadata: `PUT /admin/products/update`
   - ProductForm component (Tab 1 - Basic Information)
   - Form validation with Zod
   - CreateProductPage with tabs
   - EditProductPage with tabs

### ❌ What's Missing:
1. **Variants Management** - Not saving/loading variants
2. **Media Management** - Not uploading/saving images
3. **Product Details Loading** - Edit page not loading variants/media
4. **S3 Image Upload** - Not implemented in frontend

---

## Backend API Analysis

### Product Endpoints (Current Implementation)

#### 1. Get Product Details
**Endpoint**: `GET /admin/products/:id`
**Returns**:
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "product": {
    "id": 1,
    "name": "Product Name",
    "description": "...",
    "category_id": 5,
    "price": 29.99,
    "discount": 10,
    "status": "draft",
    "created_at": "...",
    "updated_at": "..."
  }
}
```
**⚠️ ISSUE**: Does NOT return variants and media arrays!

### Variant Endpoints (Working)

#### 2. Get Product Variants
**Endpoint**: `GET /admin/products/:id/variants`
**Returns**:
```json
{
  "success": true,
  "message": "Product variants fetched successfully",
  "variants": [
    {
      "id": 1,
      "product_id": 1,
      "size": "M",
      "color": "Blue",
      "stock": 50,
      "additional_price": 5.00
    }
  ],
  "count": 2
}
```
**⚠️ BACKEND USES**: `stock` and `additional_price` (NOT `stock_quantity` and `price`)

#### 3. Add Variant
**Endpoint**: `POST /admin/products/:id/variants`
**Request Body**:
```json
{
  "size": "M",
  "color": "Blue",
  "stock": 50,
  "additional_price": 5.00
}
```
**⚠️ NOTE**: `material` field NOT supported by backend!

#### 4. Update Variant
**Endpoint**: `PUT /admin/products/variants/:id`
**Request Body**:
```json
{
  "size": "L",
  "color": "Red",
  "stock": 75,
  "additional_price": 10.00
}
```

#### 5. Delete Variant
**Endpoint**: `DELETE /admin/products/variants/:id`
**Validation**: Cannot delete if in cart/wishlist

### Media Endpoints (Working)

#### 6. Generate Presigned URL
**Endpoint**: `POST /admin/media/upload-image?fileName=image.jpg`
**⚠️ DIFFERENT FROM DOCS**: Uses query param, not body!
**Returns**:
```json
{
  "success": true,
  "message": "Presigned URL generated successfully",
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileUrl": "https://s3.amazonaws.com/...",
  "key": "uploads/abc123.jpg"
}
```

#### 7. Add Product Media
**Endpoint**: `POST /admin/products/:id/media`
**Request Body**:
```json
{
  "url": "https://s3.amazonaws.com/...",
  "is_primary": false
}
```

#### 8. Delete Media
**Endpoint**: `DELETE /admin/products/media/:id`

#### 9. Set Primary Media
**Endpoint**: `PUT /admin/products/media/:id/primary`
**No body required** - automatically unsets other primary

---

## Implementation Plan

### Phase 1: Fix Backend Issues

#### Task 1.1: Update Get Product Details Endpoint
**File**: `/Users/apple/flutter/project/backend/src/controller/products/admin/product.admin.controller.ts`

**Current Code** (handleGetProductDetails):
```typescript
const products = await queryDb<Product[]>(
    "SELECT id, name, description, category_id, price, discount, status, created_at, updated_at FROM products WHERE id = ?",
    [id]
);

res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    product: products[0]
});
```

**Required Changes**:
```typescript
// 1. Get product
const products = await queryDb<Product[]>(
    "SELECT id, name, description, category_id, price, discount, status, created_at, updated_at FROM products WHERE id = ?",
    [id]
);

// 2. Get variants
const variants = await queryDb<ProductVariant[]>(
    "SELECT id, product_id, size, color, stock, additional_price FROM product_variants WHERE product_id = ? ORDER BY id ASC",
    [id]
);

// 3. Get media
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
```

---

### Phase 2: Update Frontend Type Definitions

#### Task 2.1: Fix VariantFormData Interface
**File**: `/Users/apple/flutter/project/web/src/types/productForm.types.ts`

**Current**:
```typescript
export interface VariantFormData {
  id?: number;
  size?: string;
  color?: string;
  material?: string;
  stock_quantity: number;
  price?: number;
}
```

**Change To**:
```typescript
export interface VariantFormData {
  id?: number;
  product_id?: number;
  size?: string;
  color?: string;
  stock: number;              // Changed from stock_quantity
  additional_price?: number;   // Changed from price
}
```

#### Task 2.2: Update Variant Validation Schema
**File**: `/Users/apple/flutter/project/web/src/types/productForm.types.ts`

**Current**:
```typescript
export const variantSchema = z.object({
  size: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  material: z.string().max(100).optional(),
  stock_quantity: z.number().int().min(0),
  price: z.number().positive().optional(),
});
```

**Change To**:
```typescript
export const variantSchema = z.object({
  size: z.string().max(50, { message: 'Size must be less than 50 characters' }).optional(),
  color: z.string().max(50, { message: 'Color must be less than 50 characters' }).optional(),
  stock: z.number({
    invalid_type_error: 'Stock must be a number',
  }).int({ message: 'Stock must be a whole number' }).min(0, { message: 'Stock cannot be negative' }),
  additional_price: z.number().min(0, { message: 'Additional price cannot be negative' }).optional(),
});
```

---

### Phase 3: Update ProductVariantsTab Component

#### Task 3.1: Remove Material Field
**File**: `/Users/apple/flutter/project/web/src/components/products/ProductVariantsTab.tsx`

**Changes Required**:
1. Remove material TextField from form dialog
2. Update table columns (remove Material column)
3. Update form reset to remove material field
4. Update newVariant object to use `stock` and `additional_price`

**Updated Form Dialog**:
```typescript
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>
    <Controller
      name="size"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="Size"
          fullWidth
          error={!!errors.size}
          helperText={errors.size?.message}
        />
      )}
    />
  </Grid>

  <Grid item xs={12} sm={6}>
    <Controller
      name="color"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="Color"
          fullWidth
          error={!!errors.color}
          helperText={errors.color?.message}
        />
      )}
    />
  </Grid>

  <Grid item xs={12} sm={6}>
    <Controller
      name="stock"
      control={control}
      render={({ field: { onChange, value, ...field } }) => (
        <TextField
          {...field}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          label="Stock Quantity"
          fullWidth
          required
          type="number"
          slotProps={{ htmlInput: { step: '1', min: '0' } }}
          error={!!errors.stock}
          helperText={errors.stock?.message}
        />
      )}
    />
  </Grid>

  <Grid item xs={12} sm={6}>
    <Controller
      name="additional_price"
      control={control}
      render={({ field: { onChange, value, ...field } }) => (
        <TextField
          {...field}
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          label="Additional Price"
          fullWidth
          type="number"
          slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
          InputProps={{
            startAdornment: <InputAdornment position="start">+$</InputAdornment>,
          }}
          error={!!errors.additional_price}
          helperText={errors.additional_price?.message || 'Extra cost for this variant'}
        />
      )}
    />
  </Grid>
</Grid>
```

**Updated Table Columns**:
```typescript
<TableHead>
  <TableRow>
    <TableCell>Size</TableCell>
    <TableCell>Color</TableCell>
    <TableCell align="right">Stock</TableCell>
    <TableCell align="right">Additional Price</TableCell>
    <TableCell align="right">Actions</TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {variants.map((variant, index) => (
    <TableRow key={index}>
      <TableCell>{variant.size || '-'}</TableCell>
      <TableCell>{variant.color || '-'}</TableCell>
      <TableCell align="right">{variant.stock}</TableCell>
      <TableCell align="right">
        {variant.additional_price ? `+$${variant.additional_price.toFixed(2)}` : '$0.00'}
      </TableCell>
      <TableCell align="right">
        {/* Actions */}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

### Phase 4: Update API Integration

#### Task 4.1: Update products.api.ts
**File**: `/Users/apple/flutter/project/web/src/api/products.api.ts`

**Add Variant API Methods**:
```typescript
// Get product variants
getProductVariants: async (productId: number): Promise<{ success: boolean; message: string; variants: VariantFormData[]; count: number }> => {
  return apiClient.get(`/admin/products/${productId}/variants`);
},

// Add variant to product
addVariant: async (productId: number, data: VariantFormData): Promise<{ success: boolean; message: string; variant: VariantFormData }> => {
  return apiClient.post(`/admin/products/${productId}/variants`, {
    size: data.size || null,
    color: data.color || null,
    stock: data.stock,
    additional_price: data.additional_price || 0,
  });
},

// Update variant
updateVariant: async (variantId: number, data: Partial<VariantFormData>): Promise<{ success: boolean; message: string; variant: VariantFormData }> => {
  return apiClient.put(`/admin/products/variants/${variantId}`, {
    size: data.size !== undefined ? data.size : undefined,
    color: data.color !== undefined ? data.color : undefined,
    stock: data.stock !== undefined ? data.stock : undefined,
    additional_price: data.additional_price !== undefined ? data.additional_price : undefined,
  });
},

// Delete variant
deleteVariant: async (variantId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete(`/admin/products/variants/${variantId}`);
},
```

**Add Media API Methods**:
```typescript
// Generate presigned URL - IMPORTANT: fileName is query param!
generatePresignedUrl: async (fileName: string): Promise<{ success: boolean; message: string; uploadUrl: string; fileUrl: string; key: string }> => {
  return apiClient.post(`/admin/media/upload-image?fileName=${encodeURIComponent(fileName)}`, {});
},

// Add product media
addProductMedia: async (productId: number, url: string, is_primary: boolean = false): Promise<{ success: boolean; message: string; media: any }> => {
  return apiClient.post(`/admin/products/${productId}/media`, { url, is_primary });
},

// Delete media
deleteMedia: async (mediaId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete(`/admin/products/media/${mediaId}`);
},

// Set primary media
setPrimaryMedia: async (mediaId: number): Promise<{ success: boolean; message: string; media: any }> => {
  return apiClient.put(`/admin/products/media/${mediaId}/primary`, {});
},
```

---

### Phase 5: Implement Product Save with Variants

#### Task 5.1: Update CreateProductPage
**File**: `/Users/apple/flutter/project/web/src/pages/products/CreateProductPage.tsx`

**Current Issue**: Only saves basic product info, not variants/media

**Solution**: Save variants and media AFTER product is created

**Updated createProductMutation**:
```typescript
const createProductMutation = useMutation({
  mutationFn: async (data: { productData: ProductBasicInfoFormData; status: 'draft' | 'published' }) => {
    // Step 1: Create product
    const response = await productsApi.createProduct({
      ...data.productData,
      status: data.status,
    });

    const productId = response.product.id;

    // Step 2: Save variants if any
    if (variants.length > 0) {
      await Promise.all(
        variants.map(variant =>
          productsApi.addVariant(productId, variant)
        )
      );
    }

    // Step 3: Save media if any
    if (media.length > 0) {
      await Promise.all(
        media.map((mediaItem, index) =>
          productsApi.addProductMedia(
            productId,
            mediaItem.url,
            mediaItem.is_primary || index === 0
          )
        )
      );
    }

    return response;
  },
  onSuccess: (data) => {
    setHasUnsavedChanges(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      navigate('/products');
    }, 1500);
  },
  onError: (error: any) => {
    setErrorMessage(error?.message || 'Failed to create product. Please try again.');
  },
});
```

---

### Phase 6: Implement Product Edit with Variants

#### Task 6.1: Load Product Data in EditProductPage
**File**: `/Users/apple/flutter/project/web/src/pages/products/EditProductPage.tsx`

**Current Issue**: Doesn't load variants/media

**Solution**: Fetch variants and media separately

**Updated Data Loading**:
```typescript
// Fetch product data
const { data: productResponse, isLoading: productLoading } = useQuery({
  queryKey: ['product', productId],
  queryFn: () => productsApi.getProductById(productId!),
  enabled: !!productId,
});

// Fetch variants
const { data: variantsResponse, isLoading: variantsLoading } = useQuery({
  queryKey: ['product-variants', productId],
  queryFn: () => productsApi.getProductVariants(productId!),
  enabled: !!productId,
});

// Combine loading states
const isLoading = productLoading || variantsLoading;

// Initialize form data when loaded
useEffect(() => {
  if (productResponse?.product) {
    const product = productResponse.product;
    setProductData({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      category_id: product.category_id,
      status: (product.status as 'draft' | 'published') || 'draft',
      price: product.price,
      compare_at_price: product.compare_at_price,
      sku: product.sku || '',
      discount: product.discount || 0,
    });
  }

  if (variantsResponse?.variants) {
    setVariants(variantsResponse.variants);
  }

  // TODO: Load media when backend returns it
}, [productResponse, variantsResponse]);
```

#### Task 6.2: Implement Variant Update/Delete Logic
**File**: `/Users/apple/flutter/project/web/src/components/products/ProductVariantsTab.tsx`

**Add Logic to Distinguish New vs Existing Variants**:
```typescript
interface ProductVariantsTabProps {
  variants: VariantFormData[];
  onVariantsChange: (variants: VariantFormData[]) => void;
  productId?: number; // Add this prop for edit mode
}

// When saving a variant:
const handleSaveVariant = async (data: VariantSchemaData) => {
  const newVariant: VariantFormData = {
    size: data.size || undefined,
    color: data.color || undefined,
    stock: data.stock,
    additional_price: data.additional_price || undefined,
  };

  let updatedVariants: VariantFormData[];

  if (editingIndex !== null) {
    // Editing existing variant
    const existingVariant = variants[editingIndex];

    if (existingVariant.id && productId) {
      // Update in backend if product exists
      try {
        await productsApi.updateVariant(existingVariant.id, newVariant);

        updatedVariants = [...variants];
        updatedVariants[editingIndex] = {
          ...existingVariant,
          ...newVariant,
        };
      } catch (error) {
        console.error('Failed to update variant:', error);
        return; // Don't update state if API call failed
      }
    } else {
      // Just update in state (not saved yet)
      updatedVariants = [...variants];
      updatedVariants[editingIndex] = newVariant;
    }
  } else {
    // Adding new variant
    if (productId) {
      // Save to backend if product exists
      try {
        const response = await productsApi.addVariant(productId, newVariant);
        updatedVariants = [...variants, response.variant];
      } catch (error) {
        console.error('Failed to add variant:', error);
        return;
      }
    } else {
      // Just add to state (will be saved when product is created)
      updatedVariants = [...variants, newVariant];
    }
  }

  onVariantsChange(updatedVariants);
  handleCloseDialog();
};

// When deleting a variant:
const handleDeleteVariant = async (index: number) => {
  const variant = variants[index];

  if (variant.id && productId) {
    // Delete from backend
    try {
      await productsApi.deleteVariant(variant.id);
    } catch (error: any) {
      alert(error.message || 'Failed to delete variant');
      return;
    }
  }

  // Remove from state
  const updatedVariants = variants.filter((_, i) => i !== index);
  onVariantsChange(updatedVariants);
};
```

---

### Phase 7: Implement Media Upload

#### Task 7.1: Update ProductMediaTab Component
**File**: `/Users/apple/flutter/project/web/src/components/products/ProductMediaTab.tsx`

**Current Issue**: Creates blob URLs, doesn't actually upload to S3

**Solution**: Implement S3 upload flow

**Updated onDrop Handler**:
```typescript
const onDrop = useCallback(async (acceptedFiles: File[]) => {
  setError(null);
  setUploading(true);

  try {
    for (const file of acceptedFiles) {
      // Step 1: Generate presigned URL
      const presignedResponse = await productsApi.generatePresignedUrl(file.name);

      // Step 2: Upload file to S3
      await axios.put(presignedResponse.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Step 3: Add to state
      const newMediaItem: MediaFormData = {
        url: presignedResponse.fileUrl,
        alt_text: file.name,
        is_primary: media.length === 0, // First image is primary
        display_order: media.length,
      };

      // Step 4: If product exists, save to backend
      if (productId) {
        const response = await productsApi.addProductMedia(
          productId,
          newMediaItem.url,
          newMediaItem.is_primary
        );
        newMediaItem.id = response.media.id;
      }

      setMedia(prev => [...prev, newMediaItem]);
    }

    onMediaChange([...media, ...newMediaItems]);
  } catch (err: any) {
    setError(err.message || 'Failed to upload images. Please try again.');
    console.error('Upload error:', err);
  } finally {
    setUploading(false);
  }
}, [media, onMediaChange, productId]);
```

**Updated handleSetPrimary**:
```typescript
const handleSetPrimary = async (index: number) => {
  const mediaItem = media[index];

  // If media has ID and product exists, update in backend
  if (mediaItem.id && productId) {
    try {
      await productsApi.setPrimaryMedia(mediaItem.id);
    } catch (error: any) {
      alert(error.message || 'Failed to set primary media');
      return;
    }
  }

  // Update in state
  const updatedMedia = media.map((item, i) => ({
    ...item,
    is_primary: i === index,
  }));
  onMediaChange(updatedMedia);
};
```

**Updated handleDelete**:
```typescript
const handleDelete = async (index: number) => {
  const mediaItem = media[index];

  // If media has ID and product exists, delete from backend
  if (mediaItem.id && productId) {
    try {
      await productsApi.deleteMedia(mediaItem.id);
    } catch (error: any) {
      alert(error.message || 'Failed to delete media');
      return;
    }
  }

  // Remove from state
  const updatedMedia = media.filter((_, i) => i !== index);

  // If we deleted the primary image, set the first image as primary
  if (updatedMedia.length > 0 && !updatedMedia.some(item => item.is_primary)) {
    updatedMedia[0].is_primary = true;

    if (updatedMedia[0].id && productId) {
      await productsApi.setPrimaryMedia(updatedMedia[0].id);
    }
  }

  // Recalculate display order
  updatedMedia.forEach((item, i) => {
    item.display_order = i;
  });

  onMediaChange(updatedMedia);
};
```

---

### Phase 8: Fix Grid Component Issues

#### Task 8.1: Replace Grid with Box
**Files**: All components using Grid (ProductForm, ProductVariantsTab)

**Issue**: MUI v7 changed Grid API

**Solution**: Already done in ProductForm - use Box with flexbox

---

## Testing Checklist

### Create Product Flow:
- [ ] Fill basic information form
- [ ] Form validation works (all fields)
- [ ] Add multiple variants
- [ ] Edit a variant
- [ ] Delete a variant
- [ ] Upload multiple images
- [ ] Set primary image
- [ ] Delete an image
- [ ] Save as Draft
- [ ] Publish product
- [ ] Verify product appears in products list
- [ ] Verify all data saved correctly

### Edit Product Flow:
- [ ] Open existing product
- [ ] Basic info loads correctly
- [ ] Existing variants load
- [ ] Existing images load
- [ ] Edit basic info and save
- [ ] Add new variant
- [ ] Edit existing variant
- [ ] Delete variant
- [ ] Upload new image
- [ ] Delete existing image
- [ ] Change primary image
- [ ] Publish draft product
- [ ] Verify all changes saved

### Edge Cases:
- [ ] Create product without variants
- [ ] Create product without images
- [ ] Try to navigate away with unsaved changes
- [ ] Auto-save draft (wait 30 seconds)
- [ ] Delete variant that's in cart (should fail with error)
- [ ] Upload large image (should compress)
- [ ] Upload invalid file type (should reject)

---

## Summary of Key Changes

### Backend Changes Required:
1. ✅ **Update `handleGetProductDetails`** to return variants and media arrays
2. ✅ Already working: Variant CRUD endpoints
3. ✅ Already working: Media CRUD endpoints
4. ✅ Already added: `status` and `updated_at` columns to products table

### Frontend Changes Required:
1. ✅ **Fix VariantFormData** interface (stock, additional_price)
2. ✅ **Update ProductVariantsTab** (remove material field)
3. ✅ **Update products.api.ts** (add variant and media methods)
4. ✅ **Implement S3 upload** in ProductMediaTab
5. ✅ **Save variants/media** in CreateProductPage
6. ✅ **Load and update variants/media** in EditProductPage
7. ✅ **Handle new vs existing variants** (create vs update logic)

### Critical Differences Between Docs and Implementation:
1. **Variants**: Backend uses `stock` and `additional_price`, NOT `stock_quantity` and `price`
2. **Variants**: `material` field NOT supported by backend
3. **Media**: Presigned URL uses query param `?fileName=...`, NOT request body
4. **Media**: Set primary endpoint doesn't need `product_id` in body
5. **Product Details**: Current endpoint doesn't return variants/media (MUST BE FIXED)

---

## Implementation Order

1. **Fix Backend** (Task 1.1) - CRITICAL
2. **Update Types** (Tasks 2.1, 2.2)
3. **Update API** (Task 4.1)
4. **Fix ProductVariantsTab** (Task 3.1)
5. **Implement Media Upload** (Task 7.1)
6. **Update CreateProductPage** (Task 5.1)
7. **Update EditProductPage** (Tasks 6.1, 6.2)
8. **Test Everything** (Testing Checklist)
