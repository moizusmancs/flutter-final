# Admin Panel Implementation Plan

## Tech Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material UI (MUI) v5
- **State Management**: React Query (TanStack Query) for server state + Context API for auth
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts or Chart.js
- **Data Tables**: MUI DataGrid or TanStack Table
- **Date Handling**: date-fns or Day.js

---

## Project Structure

```
admin-panel/
├── src/
│   ├── api/
│   │   ├── client.ts                 # Axios instance with interceptors
│   │   ├── auth.api.ts              # Auth API calls
│   │   ├── products.api.ts          # Products API calls
│   │   ├── orders.api.ts            # Orders API calls
│   │   ├── users.api.ts             # Users API calls
│   │   ├── coupons.api.ts           # Coupons API calls
│   │   ├── categories.api.ts        # Categories API calls
│   │   ├── media.api.ts             # Media API calls
│   │   └── analytics.api.ts         # Analytics API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── AdminLayout.tsx       # Main layout with sidebar & header
│   │   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   │   └── Header.tsx            # Top header with user menu
│   │   │   ├── ProtectedRoute.tsx        # Auth guard for routes
│   │   │   ├── LoadingSpinner.tsx        # Loading state component
│   │   │   ├── EmptyState.tsx            # Empty data state
│   │   │   ├── ErrorBoundary.tsx         # Error handling
│   │   │   ├── ConfirmDialog.tsx         # Confirmation modal
│   │   │   └── PageHeader.tsx            # Consistent page headers
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx              # Metric display card
│   │   │   ├── RevenueChart.tsx          # Revenue line/bar chart
│   │   │   ├── OrdersChart.tsx           # Orders distribution chart
│   │   │   ├── TopProductsTable.tsx      # Top selling products
│   │   │   └── RecentOrdersList.tsx      # Recent orders list
│   │   ├── products/
│   │   │   ├── ProductsTable.tsx         # Products data grid
│   │   │   ├── ProductForm.tsx           # Create/Edit product form
│   │   │   ├── ProductVariantForm.tsx    # Variant form
│   │   │   ├── ProductMediaManager.tsx   # Image gallery manager
│   │   │   ├── ProductFilters.tsx        # Filter sidebar/drawer
│   │   │   └── ProductStatusChip.tsx     # Status badge component
│   │   ├── orders/
│   │   │   ├── OrdersTable.tsx           # Orders data grid
│   │   │   ├── OrderDetailsDrawer.tsx    # Order details side panel
│   │   │   ├── OrderItemsList.tsx        # Order items display
│   │   │   ├── OrderStatusStepper.tsx    # Status workflow stepper
│   │   │   ├── OrderFilters.tsx          # Filter by status/date
│   │   │   └── UpdateStatusDialog.tsx    # Status update modal
│   │   ├── users/
│   │   │   ├── UsersTable.tsx            # Users data grid
│   │   │   ├── UserDetailsDrawer.tsx     # User details panel
│   │   │   ├── UserOrdersTab.tsx         # User's order history
│   │   │   ├── BlockUserDialog.tsx       # Block/unblock confirmation
│   │   │   └── UserFilters.tsx           # Search and filters
│   │   ├── coupons/
│   │   │   ├── CouponsTable.tsx          # Coupons data grid
│   │   │   ├── CouponForm.tsx            # Create/Edit coupon form
│   │   │   ├── CouponStatusChip.tsx      # Active/Expired badge
│   │   │   ├── UsageStatsDialog.tsx      # Usage statistics modal
│   │   │   └── DeleteCouponDialog.tsx    # Delete confirmation
│   │   ├── categories/
│   │   │   ├── CategoriesTable.tsx       # Categories data grid
│   │   │   ├── CategoryForm.tsx          # Create/Edit category form
│   │   │   └── DeleteCategoryDialog.tsx  # Delete confirmation
│   │   └── media/
│   │       ├── MediaUploader.tsx         # S3 upload component
│   │       ├── MediaGallery.tsx          # Image gallery grid
│   │       └── ImagePreview.tsx          # Image preview modal
│   ├── contexts/
│   │   └── AuthContext.tsx               # Authentication context
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth hook
│   │   ├── useDebounce.ts                # Debounce hook
│   │   ├── useConfirm.ts                 # Confirmation dialog hook
│   │   └── useToast.ts                   # Toast notifications hook
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── products/
│   │   │   ├── ProductsListPage.tsx
│   │   │   ├── CreateProductPage.tsx
│   │   │   └── EditProductPage.tsx
│   │   ├── orders/
│   │   │   └── OrdersListPage.tsx
│   │   ├── users/
│   │   │   └── UsersListPage.tsx
│   │   ├── coupons/
│   │   │   └── CouponsListPage.tsx
│   │   ├── categories/
│   │   │   └── CategoriesListPage.tsx
│   │   └── analytics/
│   │       └── AnalyticsPage.tsx
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── user.types.ts
│   │   ├── coupon.types.ts
│   │   ├── category.types.ts
│   │   ├── analytics.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── formatters.ts                 # Date, currency formatters
│   │   ├── validators.ts                 # Validation helpers
│   │   └── constants.ts                  # App constants
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
```

---

## Screen Breakdown & Components

### 1. Login Screen (`/login`)

**Purpose**: Admin authentication

**Components**:
- `LoginPage.tsx`
  - Material UI Card for login form
  - TextField for email
  - TextField for password (with visibility toggle)
  - Button for submit
  - Error alert banner
  - Remember me checkbox (optional)

**API Integration**:
```typescript
POST /api/v1/admin/auth/login
Body: { email, password }
Response: { success, message, admin: { id, email, fullname } }
// Token stored in HTTP-only cookie automatically
```

**Features**:
- Form validation with React Hook Form + Zod
- Loading state during authentication
- Error handling and display
- Redirect to dashboard on success
- Auto-redirect if already authenticated

---

### 2. Dashboard Screen (`/dashboard`)

**Purpose**: Overview of key metrics and insights

**Components**:

#### Top Section - Key Metrics (Grid Layout)
- `StatCard.tsx` (4 cards in a row)
  - Total Revenue (with growth %)
  - Total Orders (with growth %)
  - Total Users
  - Active Products

#### Middle Section - Charts (2 columns)
- `RevenueChart.tsx` (Left, 60% width)
  - Line/Area chart showing revenue over time
  - Period selector: Last 7 days, 30 days, 90 days, Custom range
  - Date range picker for custom

- `OrdersChart.tsx` (Right, 40% width)
  - Pie/Donut chart showing order status distribution
  - Pending, Paid, Shipped, Delivered, Cancelled

#### Bottom Section - Tables (2 columns)
- `TopProductsTable.tsx` (Left, 50% width)
  - Product name with image
  - Total quantity sold
  - Total revenue
  - Order count
  - Limit selector: Top 5, 10, 20

- `RecentOrdersList.tsx` (Right, 50% width)
  - Order ID
  - Customer name
  - Amount
  - Status chip
  - Created date
  - View details button

**API Integration**:
```typescript
GET /api/v1/admin/analytics/stats
Response: {
  orders: { total, pending, paid, shipped, delivered, cancelled },
  revenue: { total, average_order_value, last_30_days, growth_percentage },
  users: { total, new_last_30_days },
  products: { total, active, categories, variants }
}

GET /api/v1/admin/analytics/revenue?period=month&start_date=...&end_date=...
Response: {
  period: "month",
  data: [{ period, total_orders, revenue, average_order_value }]
}

GET /api/v1/admin/analytics/top-products?limit=10&period=30days
Response: {
  products: [{ id, name, slug, order_count, total_quantity_sold, total_revenue, image_url }]
}

GET /api/v1/admin/analytics/recent-orders?limit=10
Response: {
  orders: [{ id, user_id, total_amount, status, created_at, user_name, user_email, item_count }]
}
```

**Features**:
- Auto-refresh every 5 minutes (React Query refetch interval)
- Skeleton loading states for each section
- Interactive charts with tooltips
- Click on recent order to view details
- Click on top product to navigate to product page

---

### 3. Products List Screen (`/products`)

**Purpose**: View, search, filter, and manage all products

**Layout**: Full-width data grid with sidebar filters

**Components**:

#### Header Section
- `PageHeader.tsx`
  - Title: "Products"
  - Create Product button (navigates to `/products/create`)
  - Search bar (debounced search)

#### Left Sidebar (Drawer - collapsible)
- `ProductFilters.tsx`
  - Category multi-select
  - Status select (all, active, inactive, out_of_stock)
  - Price range slider
  - Stock range input
  - Clear filters button
  - Apply filters button

#### Main Content
- `ProductsTable.tsx` (MUI DataGrid)
  - Columns:
    - Checkbox (bulk selection)
    - Image (thumbnail)
    - Name (clickable)
    - SKU
    - Category
    - Price
    - Stock (with low stock warning badge)
    - Status chip (Active/Inactive/Out of Stock)
    - Actions menu (Edit, Delete, View Variants)
  - Pagination (server-side)
  - Sorting (server-side)
  - Row click to navigate to edit page

#### Dialogs/Modals
- Delete confirmation dialog
- Bulk actions menu (Activate, Deactivate, Delete selected)

**API Integration**:
```typescript
GET /api/v1/admin/products?page=1&limit=20&search=...&category=...&status=...
Response: {
  products: [...],
  pagination: { page, limit, total, totalPages }
}

DELETE /api/v1/admin/products/:id
Response: { success, message }

PUT /api/v1/admin/products/:id/status
Body: { status: 'active' | 'inactive' }
Response: { success, message, product }
```

**Features**:
- Debounced search (300ms)
- Persistent filters in URL query params
- Export to CSV button
- Skeleton loading for table rows
- Empty state when no products
- Error state with retry button

---

### 4. Create/Edit Product Screen (`/products/create`, `/products/:id/edit`)

**Purpose**: Create new product or edit existing one

**Layout**: Multi-step form or tabbed interface

**Components**:

#### Using Tabs Approach:

**Tab 1: Basic Information**
- `ProductForm.tsx` (Basic Info Section)
  - Product Name (TextField)
  - Slug (auto-generated, editable)
  - Description (Rich text editor or Textarea)
  - Category (Select dropdown)
  - Status (Select: active, inactive)
  - Price (Number input with currency symbol)
  - Compare at Price (optional)
  - SKU (TextField)

**Tab 2: Variants**
- `ProductVariantForm.tsx`
  - Variants list table
  - Add Variant button
  - Each variant row:
    - Size (TextField)
    - Color (Color picker or TextField)
    - Material (TextField)
    - Stock Quantity (Number input)
    - Actions (Edit, Delete)
  - Variant dialog for add/edit

**Tab 3: Media**
- `ProductMediaManager.tsx`
  - Image upload area (drag & drop)
  - Image gallery grid
  - Each image:
    - Preview thumbnail
    - Set as primary button
    - Delete button
    - Reorder handle (drag to reorder)
  - S3 presigned URL upload

**Tab 4: SEO & Details**
- Meta title
- Meta description
- Tags (Chip input)
- Weight, dimensions (optional)

#### Footer Actions (Sticky)
- Cancel button (back to list)
- Save as Draft button (status = inactive)
- Publish button (status = active)

**API Integration**:
```typescript
// Create Product
POST /api/v1/admin/products
Body: { name, description, slug, category_id, price, compare_at_price, status, sku }
Response: { success, message, product }

// Update Product
PUT /api/v1/admin/products/:id
Body: { name?, description?, ... }
Response: { success, message, product }

// Get Product Details
GET /api/v1/admin/products/:id
Response: { success, product, variants, media }

// Add Variant
POST /api/v1/admin/products/:id/variants
Body: { size, color, material, stock_quantity }
Response: { success, message, variant }

// Update Variant
PUT /api/v1/admin/products/variants/:id
Body: { size?, color?, stock_quantity?, ... }
Response: { success, message, variant }

// Delete Variant
DELETE /api/v1/admin/products/variants/:id
Response: { success, message }

// Get Presigned URL for Upload
POST /api/v1/admin/media/presigned-url
Body: { fileName, fileType }
Response: { success, url, key }

// Upload to S3
PUT <presigned_url>
Body: File binary

// Add Media to Product
POST /api/v1/admin/products/:id/media
Body: { url: s3_url, is_primary }
Response: { success, message, media }

// Delete Media
DELETE /api/v1/admin/media/:id
Response: { success, message }

// Set Primary Media
PUT /api/v1/admin/media/:id/primary
Body: { product_id }
Response: { success, message }
```

**Features**:
- Auto-save draft every 30 seconds
- Unsaved changes warning when navigating away
- Image preview before upload
- Drag & drop image upload
- Image optimization client-side before upload
- Validation errors inline
- Success toast on save

---

### 5. Orders List Screen (`/orders`)

**Purpose**: View and manage all orders

**Layout**: Full-width data grid with filters

**Components**:

#### Header Section
- `PageHeader.tsx`
  - Title: "Orders"
  - Date range picker
  - Export orders button (CSV/Excel)

#### Top Filters Bar
- `OrderFilters.tsx`
  - Status tabs: All, Pending, Paid, Shipped, Delivered, Cancelled
  - Search by order ID or customer email
  - Date range filter

#### Main Content
- `OrdersTable.tsx` (MUI DataGrid)
  - Columns:
    - Order ID (clickable)
    - Customer Name
    - Email
    - Total Amount (formatted currency)
    - Payment Method
    - Status chip (color-coded)
    - Items Count
    - Created Date
    - Actions (View Details, Update Status)
  - Pagination (server-side)
  - Sorting by date, amount

#### Side Drawer (Opens on row click)
- `OrderDetailsDrawer.tsx`
  - Header: Order #ID, Status stepper
  - Customer info section
  - Shipping address section
  - `OrderItemsList.tsx`
    - Product image, name, variant
    - Quantity
    - Price at purchase
    - Subtotal
  - Payment details section
  - Coupon info (if applied)
  - Order totals breakdown
  - `UpdateStatusDialog.tsx` button
  - Close button

**API Integration**:
```typescript
GET /api/v1/admin/orders?page=1&limit=20&status=...&search=...&start_date=...&end_date=...
Response: {
  orders: [...],
  pagination: { page, limit, total, totalPages }
}

GET /api/v1/admin/orders/:id
Response: {
  order: { id, user_id, total_amount, status, ... },
  items: [{ product_name, variant_details, quantity, price_at_purchase }],
  user: { fullname, email, phone },
  shipping_address: { ... },
  coupon: { code, discount_applied }
}

PUT /api/v1/admin/orders/:id/status
Body: { status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' }
Response: { success, message, order }

GET /api/v1/admin/orders/stats
Response: { total_orders, revenue, order distribution by status, ... }
```

**Features**:
- Real-time status updates
- Bulk status update
- Print invoice button
- Send notification email to customer
- Filter persistence in URL
- Export filtered results

---

### 6. Users List Screen (`/users`)

**Purpose**: View and manage users

**Layout**: Full-width data grid

**Components**:

#### Header Section
- `PageHeader.tsx`
  - Title: "Users"
  - Search bar

#### Top Filters
- `UserFilters.tsx`
  - Status filter: All, Active, Blocked
  - Sort by: Newest, Oldest, Most Orders, Highest Spending

#### Main Content
- `UsersTable.tsx` (MUI DataGrid)
  - Columns:
    - User ID
    - Full Name
    - Email
    - Phone
    - Total Orders
    - Total Spent (formatted currency)
    - Status (Active/Blocked chip)
    - Registered Date
    - Actions (View Details, Block/Unblock)
  - Pagination (server-side)

#### Side Drawer
- `UserDetailsDrawer.tsx`
  - Tabs:
    - **Overview Tab**:
      - User info card
      - Stats: Total orders, Total spent, Addresses count
      - Quick actions: Block/Unblock, Send email
    - **Orders Tab**:
      - `UserOrdersTab.tsx` - List of user's orders with mini table
    - **Addresses Tab**:
      - List of saved addresses

**API Integration**:
```typescript
GET /api/v1/admin/users?page=1&limit=20&search=...&is_blocked=...
Response: {
  users: [...],
  pagination: { page, limit, total, totalPages }
}

GET /api/v1/admin/users/:id
Response: {
  user: { id, fullname, email, phone, is_blocked, created_at, ... },
  addresses_count, orders_count, total_spent
}

GET /api/v1/admin/users/:id/orders?page=1&limit=10
Response: {
  orders: [...],
  pagination: { ... }
}

PUT /api/v1/admin/users/:id/block
Body: { is_blocked: true | false }
Response: { success, message, user }
```

**Features**:
- Quick block/unblock toggle
- View user's complete order history
- Search by name, email, phone
- Export users list

---

### 7. Coupons List Screen (`/coupons`)

**Purpose**: Manage discount coupons

**Layout**: Data grid with create button

**Components**:

#### Header Section
- `PageHeader.tsx`
  - Title: "Coupons"
  - Create Coupon button (opens dialog)

#### Main Content
- `CouponsTable.tsx` (MUI DataGrid)
  - Columns:
    - Code
    - Discount % (formatted with % symbol)
    - Min Order Amount (formatted currency)
    - Status chip (Active/Expired)
    - Expires At (formatted date)
    - Actions (Edit, Delete, View Usage)
  - Pagination
  - Filter by: All, Active, Expired

#### Dialogs
- `CouponForm.tsx` (Create/Edit Dialog)
  - Code (TextField, uppercase)
  - Discount Percent (Number input, 1-100)
  - Min Order Amount (Number input, optional)
  - Expiry Date (DateTimePicker)
  - Save & Cancel buttons

- `UsageStatsDialog.tsx` (Usage Statistics)
  - Total uses
  - Total discount given
  - Average discount per order
  - First used date
  - Last used date
  - Recent orders table (mini)

- `DeleteCouponDialog.tsx` (Confirmation)
  - Warning if coupon has been used
  - Confirm & Cancel buttons

**API Integration**:
```typescript
GET /api/v1/admin/coupons
Response: {
  coupons: [{ id, code, discount_percent, min_order_amount, expires_at, is_active, is_expired }],
  count
}

POST /api/v1/admin/coupons
Body: { code, discount_percent, min_order_amount?, expires_at? }
Response: { success, message, coupon }

PUT /api/v1/admin/coupons/:id
Body: { code?, discount_percent?, min_order_amount?, expires_at? }
Response: { success, message, coupon }

DELETE /api/v1/admin/coupons/:id
Response: { success, message }

GET /api/v1/admin/coupons/:id/usage
Response: {
  coupon: { ... },
  stats: { total_uses, total_discount_given, average_discount, first_used_at, last_used_at },
  recent_orders: [...]
}
```

**Features**:
- Auto-uppercase coupon codes
- Expiry date validation (must be future)
- Cannot delete coupons with usage history (show error)
- Copy coupon code to clipboard
- Filter by active/expired status

---

### 8. Categories Screen (`/categories`)

**Purpose**: Manage product categories

**Layout**: Simple table with inline editing

**Components**:

#### Header Section
- `PageHeader.tsx`
  - Title: "Categories"
  - Create Category button (opens dialog)

#### Main Content
- `CategoriesTable.tsx` (Simple Table or DataGrid)
  - Columns:
    - ID
    - Name
    - Slug
    - Product Count (read-only)
    - Created Date
    - Actions (Edit, Delete)
  - No pagination (usually small dataset)

#### Dialogs
- `CategoryForm.tsx` (Create/Edit Dialog)
  - Name (TextField)
  - Slug (auto-generated, editable)
  - Description (Textarea, optional)
  - Save & Cancel buttons

- `DeleteCategoryDialog.tsx`
  - Warning if category has products
  - Confirm & Cancel

**API Integration**:
```typescript
GET /api/v1/admin/categories
Response: {
  categories: [{ id, name, slug, product_count }]
}

POST /api/v1/admin/categories
Body: { name, slug }
Response: { success, message, category }

PUT /api/v1/admin/categories/:id
Body: { name?, slug? }
Response: { success, message, category }

DELETE /api/v1/admin/categories/:id
Response: { success, message }
```

**Features**:
- Auto-generate slug from name
- Validate unique slug
- Cannot delete categories with products (show error)
- Inline edit (click to edit)

---

### 9. Analytics Screen (`/analytics`)

**Purpose**: Deep dive into business metrics

**Layout**: Dashboard with multiple chart sections

**Components**:

#### Section 1: Revenue Analysis
- `RevenueChart.tsx` (Large Line/Area Chart)
  - X-axis: Time period
  - Y-axis: Revenue
  - Period selector: Day, Week, Month, Year
  - Custom date range picker
  - Export chart as image button

#### Section 2: Sales Breakdown
- Pie charts showing:
  - Orders by status
  - Revenue by payment method
  - Sales by category

#### Section 3: Top Performers
- `TopProductsTable.tsx` (Detailed)
  - Product image & name
  - Total quantity sold
  - Total revenue
  - Average price
  - Order count
  - Period selector

#### Section 4: Trends
- Cards showing:
  - Revenue growth (last 30 days vs previous)
  - Order growth
  - New users growth
  - Average order value trend

**API Integration**:
```typescript
GET /api/v1/admin/analytics/stats
// Same as dashboard

GET /api/v1/admin/analytics/revenue?period=month&start_date=...&end_date=...
Response: {
  data: [{ period, total_orders, revenue, average_order_value, completed_orders, cancelled_orders }]
}

GET /api/v1/admin/analytics/top-products?limit=20&period=30days
Response: {
  products: [...]
}
```

**Features**:
- Interactive charts with zoom
- Export data as CSV/Excel
- Print report
- Compare time periods
- Real-time data refresh

---

## Common Components Details

### Layout Components

#### `AdminLayout.tsx`
- Persistent sidebar (collapsible on mobile)
- Top header with:
  - Breadcrumbs
  - Notifications bell icon
  - Admin profile menu
- Main content area with padding
- Footer (optional)

#### `Sidebar.tsx`
- Navigation menu items:
  - Dashboard (Home icon)
  - Products (Inventory icon)
  - Orders (Shopping Bag icon)
  - Users (People icon)
  - Coupons (LocalOffer icon)
  - Categories (Category icon)
  - Analytics (Analytics icon)
- Active route highlighting
- Logout button at bottom

#### `Header.tsx`
- App title/logo
- Breadcrumb navigation
- Profile dropdown:
  - View Profile
  - Settings
  - Logout

### Utility Components

#### `ProtectedRoute.tsx`
```typescript
// Checks if admin token exists
// Redirects to /login if not authenticated
// Renders children if authenticated
```

#### `ConfirmDialog.tsx`
```typescript
interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
}
```

#### `LoadingSpinner.tsx`
- Centered CircularProgress
- Optional backdrop overlay
- Fullscreen or inline variants

#### `EmptyState.tsx`
```typescript
interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## API Integration Strategy

### 1. Axios Client Setup (`api/client.ts`)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data, // Return only data
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### 2. React Query Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 3. API Module Example (`api/products.api.ts`)

```typescript
import apiClient from './client';
import { Product, ProductFormData, ProductsResponse } from '../types/product.types';

export const productsApi = {
  // Get all products with filters
  getProducts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    status?: string;
  }): Promise<ProductsResponse> => {
    return apiClient.get('/admin/products', { params });
  },

  // Get single product
  getProduct: async (id: number): Promise<{ success: boolean; product: Product }> => {
    return apiClient.get(`/admin/products/${id}`);
  },

  // Create product
  createProduct: async (data: ProductFormData) => {
    return apiClient.post('/admin/products', data);
  },

  // Update product
  updateProduct: async (id: number, data: Partial<ProductFormData>) => {
    return apiClient.put(`/admin/products/${id}`, data);
  },

  // Delete product
  deleteProduct: async (id: number) => {
    return apiClient.delete(`/admin/products/${id}`);
  },

  // Update product status
  updateProductStatus: async (id: number, status: 'active' | 'inactive') => {
    return apiClient.put(`/admin/products/${id}/status`, { status });
  },

  // Get product variants
  getProductVariants: async (productId: number) => {
    return apiClient.get(`/admin/products/${productId}/variants`);
  },

  // Add variant
  addVariant: async (productId: number, data: any) => {
    return apiClient.post(`/admin/products/${productId}/variants`, data);
  },

  // Update variant
  updateVariant: async (variantId: number, data: any) => {
    return apiClient.put(`/admin/products/variants/${variantId}`, data);
  },

  // Delete variant
  deleteVariant: async (variantId: number) => {
    return apiClient.delete(`/admin/products/variants/${variantId}`);
  },
};
```

### 4. React Query Hook Example

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { useToast } from './useToast';

export const useProducts = (params: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id, // Only fetch if id exists
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess(data.message || 'Product created successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      showSuccess(data.message || 'Product updated successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess(data.message || 'Product deleted successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to delete product');
    },
  });
};
```

### 5. Component Usage Example

```typescript
// pages/products/ProductsListPage.tsx
import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import ProductsTable from '../../components/products/ProductsTable';
import { useConfirm } from '../../hooks/useConfirm';

export default function ProductsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category_id: null, status: 'all' });

  const { data, isLoading, error } = useProducts({
    page,
    limit: 20,
    search,
    ...filters,
  });

  const deleteProduct = useDeleteProduct();
  const confirm = useConfirm();

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      severity: 'error',
    });

    if (confirmed) {
      deleteProduct.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <Box>
      <PageHeader
        title="Products"
        action={{
          label: 'Create Product',
          onClick: () => navigate('/products/create'),
        }}
      />

      <ProductsTable
        products={data.products}
        pagination={data.pagination}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </Box>
  );
}
```

---

## State Management

### Authentication State (Context)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

interface Admin {
  id: number;
  email: string;
  fullname: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authApi.checkAuth();
      if (response.success) {
        setAdmin(response.admin);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAdmin(response.admin);
  };

  const logout = async () => {
    await authApi.logout();
    setAdmin(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Server State (React Query)
- All API data managed by React Query
- Automatic caching, refetching, and synchronization
- Optimistic updates for better UX

### Form State (React Hook Form)
- Each form manages its own state
- Validation with Zod schemas
- Error handling per field

---

## Routing Structure

```typescript
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from './components/common/Layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'products',
        children: [
          { index: true, element: <ProductsListPage /> },
          { path: 'create', element: <CreateProductPage /> },
          { path: ':id/edit', element: <EditProductPage /> },
        ],
      },
      {
        path: 'orders',
        element: <OrdersListPage />,
      },
      {
        path: 'users',
        element: <UsersListPage />,
      },
      {
        path: 'coupons',
        element: <CouponsListPage />,
      },
      {
        path: 'categories',
        element: <CategoriesListPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
```

---

## Error Handling Strategy

### 1. API Error Handling
- Axios interceptor catches all errors
- 401 errors redirect to login
- Other errors show toast notifications
- Validation errors displayed inline on forms

### 2. UI Error Boundaries
```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // Catches React errors and displays fallback UI
}
```

### 3. Query Error Handling
```typescript
// Global error handler in React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        console.error('Query error:', error);
        // Show toast notification
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        // Show toast notification
      },
    },
  },
});
```

---

## UI/UX Best Practices

### Loading States
- Skeleton loaders for tables and cards
- Spinner for forms and actions
- Progress indicators for uploads
- Disable buttons during mutations

### Empty States
- Friendly messages when no data
- Call-to-action buttons
- Helpful illustrations

### Success Feedback
- Toast notifications for actions
- Success icons and animations
- Confirmation messages

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Table horizontal scroll on mobile
- Stack cards vertically on mobile

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

---

## Development Phases

### Phase 1: Setup & Auth (Week 1)
- [ ] Project setup (Vite + React + TypeScript + MUI)
- [ ] Routing configuration
- [ ] Axios client setup
- [ ] React Query setup
- [ ] Auth context and login page
- [ ] Protected routes
- [ ] Admin layout with sidebar

### Phase 2: Dashboard & Products (Week 2)
- [ ] Dashboard page with analytics
- [ ] Products list page
- [ ] Create/Edit product pages
- [ ] Product variants management
- [ ] Media upload functionality

### Phase 3: Orders & Users (Week 3)
- [ ] Orders list page
- [ ] Order details drawer
- [ ] Update order status
- [ ] Users list page
- [ ] User details and orders

### Phase 4: Coupons, Categories & Analytics (Week 4)
- [ ] Coupons management
- [ ] Categories management
- [ ] Analytics page with charts
- [ ] Export functionality
- [ ] Final testing and bug fixes

### Phase 5: Polish & Deploy (Week 5)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Deployment setup

---

## Performance Optimizations

1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Compress images before upload
   - Use WebP format
   - Lazy load images in galleries

3. **Data Fetching**
   - Server-side pagination
   - Debounced search
   - Cache management with React Query

4. **Bundle Optimization**
   - Tree shaking
   - Minimize bundle size
   - Use production builds

5. **Memoization**
   - useMemo for expensive calculations
   - React.memo for expensive components
   - useCallback for event handlers

---

## Testing Strategy

1. **Unit Tests** (Vitest)
   - Utility functions
   - Custom hooks
   - Helper functions

2. **Component Tests** (React Testing Library)
   - Form validation
   - User interactions
   - Conditional rendering

3. **Integration Tests**
   - API integration
   - Auth flow
   - CRUD operations

4. **E2E Tests** (Playwright/Cypress)
   - Critical user flows
   - Login → Create Product → Publish
   - Order management flow

---

## Deployment Considerations

1. **Environment Variables**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
   VITE_S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com
   ```

2. **Build Configuration**
   - Production optimizations
   - Source maps for debugging
   - Environment-specific configs

3. **Hosting Options**
   - Vercel (recommended for React apps)
   - Netlify
   - AWS S3 + CloudFront
   - Nginx on VPS

4. **CI/CD Pipeline**
   - Automated testing
   - Build on push to main
   - Auto-deploy to staging/production

---

## Security Considerations

1. **Authentication**
   - HTTP-only cookies for tokens
   - Automatic token refresh
   - Logout on token expiration

2. **Authorization**
   - Verify admin role on every request
   - Protected routes client-side
   - Server-side validation

3. **XSS Prevention**
   - Sanitize user inputs
   - Use DOMPurify for rich text
   - CSP headers

4. **CSRF Protection**
   - CSRF tokens (if needed)
   - SameSite cookie attribute

---

This comprehensive plan covers all aspects of building a production-ready admin panel for your e-commerce backend!
