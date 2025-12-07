# Amber Atelier API Documentation

REST API for the Amber Atelier e-commerce platform.

## Base URL
```
/api
```

## Authentication
Admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Public Endpoints

### GET /api/products
Get list of products with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12) - Items per page
- `category` (string, optional) - Filter by category
- `minPrice` (number, optional) - Minimum price filter
- `maxPrice` (number, optional) - Maximum price filter
- `search` (string, optional) - Search in title and description
- `sortBy` (string, optional) - Sort order: `featured`, `price-asc`, `price-desc`, `name`, `newest`

**Response:**
```json
{
  "data": [
    {
      "id": 1733139200000,
      "title": "Aurora Crown Ring",
      "slug": "aurora-crown-ring",
      "description": "Scalloped setting with oval-cut morganite",
      "price": 165000,
      "sale_price": null,
      "images": [
        {
          "url": "data:image/jpeg;base64,...",
          "alt": "Aurora Crown Ring",
          "is_primary": true
        }
      ],
      "inventory": {
        "sku": "AMB-12345678-123",
        "stock_count": 5
      },
      "attributes": [
        { "name": "metal", "value": "18k Rose Gold" },
        { "name": "gemstone", "value": "Morganite" }
      ],
      "active": true,
      "createdAt": "2025-12-02T10:00:00.000Z",
      "updatedAt": "2025-12-02T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3,
  "limit": 12
}
```

**Example:**
```javascript
const products = await AmberAPI.getProducts({
  page: 1,
  limit: 12,
  category: 'ring',
  minPrice: 50000,
  maxPrice: 200000,
  sortBy: 'price-asc'
});
```

---

### GET /api/products/:slug
Get single product by slug.

**URL Parameters:**
- `slug` (string, required) - Product slug

**Response:**
```json
{
  "id": 1733139200000,
  "title": "Aurora Crown Ring",
  "slug": "aurora-crown-ring",
  "description": "Scalloped setting with oval-cut morganite",
  "price": 165000,
  "sale_price": null,
  "images": [...],
  "inventory": {...},
  "attributes": [...],
  "active": true,
  "createdAt": "2025-12-02T10:00:00.000Z",
  "updatedAt": "2025-12-02T10:00:00.000Z"
}
```

**Example:**
```javascript
const product = await AmberAPI.getProductBySlug('aurora-crown-ring');
```

**Error Responses:**
- `404` - Product not found
- `404` - Product not available (inactive or out of stock)

---

### GET /api/categories
Get all product categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Rings",
    "slug": "rings",
    "parent_id": null
  },
  {
    "id": 2,
    "name": "Engagement Rings",
    "slug": "engagement-rings",
    "parent_id": 1
  }
]
```

**Example:**
```javascript
const categories = await AmberAPI.getCategories();
```

---

## Admin Endpoints

### POST /api/auth/login
Admin authentication.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Example:**
```javascript
const response = await AmberAPI.login({
  email: 'admin@example.com',
  password: 'your-password'
});
```

**Error Responses:**
- `401` - Invalid credentials

---

### POST /api/admin/products
Create new product. Requires authentication.

**Request Body:**
```json
{
  "title": "Diamond Eternity Ring",
  "description": "Stunning eternity ring with brilliant cut diamonds",
  "price": 185000,
  "sale_price": null,
  "categories": [],
  "tags": ["rings", "diamond", "luxury"],
  "images": [
    {
      "url": "data:image/jpeg;base64,...",
      "alt": "Diamond Eternity Ring",
      "is_primary": true
    }
  ],
  "stock_count": 8,
  "attributes": [
    { "name": "metal", "value": "18k White Gold" },
    { "name": "gemstone", "value": "Diamond" }
  ],
  "active": true,
  "lowStockThreshold": 3
}
```

**Response:**
```json
{
  "id": 1733139200000,
  "title": "Diamond Eternity Ring",
  "slug": "diamond-eternity-ring",
  "inventory": {
    "sku": "AMB-12345678-123",
    "stock_count": 8
  },
  "createdAt": "2025-12-02T10:00:00.000Z",
  "updatedAt": "2025-12-02T10:00:00.000Z",
  ...
}
```

**Example:**
```javascript
const newProduct = await AmberAPI.createProduct({
  title: 'Diamond Eternity Ring',
  description: 'Stunning eternity ring...',
  price: 185000,
  stock_count: 8,
  images: [{url: imageBase64, alt: 'Ring', is_primary: true}],
  attributes: [
    {name: 'metal', value: '18k White Gold'}
  ]
});
```

**Error Responses:**
- `401` - Unauthorized (not authenticated)

---

### PUT /api/admin/products/:id
Update product. Requires authentication.

**URL Parameters:**
- `id` (number, required) - Product ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Product Name",
  "description": "Updated description",
  "price": 175000,
  "sale_price": 165000,
  "stock_count": 10,
  "active": true,
  "attributes": [
    { "name": "metal", "value": "18k Rose Gold" }
  ]
}
```

**Response:**
```json
{
  "id": 1733139200000,
  "title": "Updated Product Name",
  "updatedAt": "2025-12-02T11:00:00.000Z",
  ...
}
```

**Example:**
```javascript
const updated = await AmberAPI.updateProduct(1733139200000, {
  price: 175000,
  sale_price: 165000,
  stock_count: 10
});
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Product not found

---

### DELETE /api/admin/products/:id
Delete product. Requires authentication.

**URL Parameters:**
- `id` (number, required) - Product ID

**Response:**
```json
true
```

**Example:**
```javascript
await AmberAPI.deleteProduct(1733139200000);
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Product not found

---

### GET /api/admin/products
Get all products including inactive and out of stock. Requires authentication.

**Query Parameters:**
- `includeInactive` (boolean, default: false) - Include inactive products
- `stockStatus` (string, optional) - Filter by stock: `in-stock`, `low`, `out`

**Response:**
```json
[
  {
    "id": 1733139200000,
    "title": "Aurora Crown Ring",
    "active": true,
    "inventory": {
      "sku": "AMB-12345678-123",
      "stock_count": 5
    },
    ...
  }
]
```

**Example:**
```javascript
// Get all products including inactive
const allProducts = await AmberAPI.getAdminProducts({
  includeInactive: true
});

// Get only low stock products
const lowStock = await AmberAPI.getAdminProducts({
  stockStatus: 'low'
});
```

**Error Responses:**
- `401` - Unauthorized

---

### POST /api/admin/upload
Upload product image. Requires authentication.

**Request:** multipart/form-data with image file

**Response:**
```json
{
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Example:**
```javascript
const fileInput = document.getElementById('image-input');
const file = fileInput.files[0];
const result = await AmberAPI.uploadImage(file);
console.log('Image URL:', result.url);
```

**Error Responses:**
- `401` - Unauthorized
- `400` - Invalid image file

---

### GET /api/admin/stats
Get dashboard statistics. Requires authentication.

**Response:**
```json
{
  "inventory": {
    "total": 45,
    "active": 42,
    "inStock": 38,
    "lowStock": 5,
    "outOfStock": 2,
    "totalValue": 8500000
  },
  "orders": {
    "total": 128,
    "pending": 12,
    "completed": 110,
    "totalRevenue": 15600000
  },
  "recentActivity": {
    "orders": [
      {
        "id": "AMB-1733139200",
        "total": 165000,
        "status": "pending",
        "createdAt": "2025-12-02T10:00:00.000Z"
      }
    ],
    "products": [
      {
        "id": 1733139200000,
        "title": "Aurora Crown Ring",
        "createdAt": "2025-12-02T10:00:00.000Z"
      }
    ]
  }
}
```

**Example:**
```javascript
const stats = await AmberAPI.getStats();
console.log('Total Products:', stats.inventory.total);
console.log('Total Revenue:', stats.orders.totalRevenue);
```

**Error Responses:**
- `401` - Unauthorized

---

## Error Handling

All endpoints return errors in the following format:

```javascript
try {
  const product = await AmberAPI.getProductBySlug('invalid-slug');
} catch (error) {
  console.error(error.message); // "Product not found"
}
```

Common error messages:
- `"Unauthorized: Authentication required"` - Not logged in or session expired
- `"Product not found"` - Invalid product ID/slug
- `"Invalid credentials"` - Wrong email/password
- `"Invalid image file"` - Non-image file uploaded

---

## Data Models

### Product
```typescript
{
  id: number;                    // Unique identifier
  title: string;                 // Product name
  slug: string;                  // URL-friendly name
  description: string;           // Product description
  price: number;                 // Regular price
  sale_price: number | null;     // Sale price (optional)
  categories: number[];          // Category IDs
  tags: string[];                // Search tags
  images: Image[];               // Product images
  inventory: Inventory;          // Stock information
  attributes: Attribute[];       // Custom attributes
  active: boolean;               // Visibility status
  lowStockThreshold: number;     // Alert threshold
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Image
```typescript
{
  url: string;        // Image URL or base64
  alt: string;        // Alt text
  is_primary: boolean; // Primary image flag
}
```

### Inventory
```typescript
{
  sku: string;        // Stock keeping unit
  stock_count: number; // Available quantity
}
```

### Attribute
```typescript
{
  name: string;   // Attribute name (e.g., "metal")
  value: string;  // Attribute value (e.g., "18k Gold")
}
```

---

## Usage in HTML

Include the API script before your application code:

```html
<script src="assets/js/api.js"></script>
<script>
  // API is available as window.AmberAPI
  AmberAPI.getProducts({ limit: 6 })
    .then(result => console.log(result))
    .catch(error => console.error(error));
</script>
```

---

## Migration to Real Backend

This API layer uses localStorage and can be easily migrated to a real REST backend:

1. Replace `localStorage` operations with `fetch()` calls
2. Update base URL to your API server
3. Add proper JWT token handling
4. Implement server-side validation and security

Example migration:
```javascript
// Before (localStorage)
async getProducts(params) {
  const products = this._getProducts();
  // ... filter and return
}

// After (REST API)
async getProducts(params) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${this.baseURL}/products?${queryString}`);
  return await response.json();
}
```

---

## Rate Limiting

Currently no rate limiting (localStorage-based). When migrating to a real backend, implement:
- 100 requests per minute for public endpoints
- 1000 requests per minute for authenticated admin endpoints

---

## Support

For API questions or issues, contact the development team.
