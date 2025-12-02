# Amber Atelier Backend - Starter Code

This folder contains production-ready backend code for migrating from localStorage to a real Node.js/Express/MongoDB backend.

## 📁 File Structure

```
server-starter/
├── Product.js          - Mongoose product schema
├── Category.js         - Mongoose category schema  
├── User.js             - Mongoose admin user schema
├── Order.js            - Mongoose order schema
├── adminProducts.js    - Admin product routes (CRUD)
├── publicProducts.js   - Public product routes
├── authRoutes.js       - Authentication routes
├── auth.js             - JWT middleware
├── upload.js           - S3 image upload routes
├── stats.js            - Analytics/dashboard routes
├── server.js           - Main Express server
├── package.json        - Dependencies
├── .env.example        - Environment variables template
└── README.md           - This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server-starter
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at mongodb.com/cloud/atlas
- Create cluster and get connection string
- Update MONGODB_URI in .env

### 4. Run Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on http://localhost:5000

## 📊 Data Models

### Product Schema
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  price: Number,
  salePrice: Number,
  categories: [ObjectId],
  tags: [String],
  images: [{url, alt, isPrimary}],
  inventory: {sku, stock},
  attributes: [{name, value}],
  active: Boolean,
  lowStockThreshold: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'editor' | 'viewer',
  active: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  orderNumber: String (unique),
  userId: ObjectId,
  items: [{productId, title, sku, price, quantity, subtotal}],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  shippingAddress: Object,
  billingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Public Routes

- `GET /api/products` - List products (paginated, filtered)
- `GET /api/products/:slug` - Get single product
- `GET /api/categories` - List categories
- `POST /api/auth/login` - Admin login

### Admin Routes (Require JWT)

- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/stock` - Update stock
- `GET /api/admin/products/alerts/low-stock` - Low stock alerts
- `GET /api/admin/upload-url` - Get S3 pre-signed URL
- `POST /api/admin/upload` - Direct file upload
- `GET /api/admin/stats` - Dashboard statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

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
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Use token in subsequent requests:**
```bash
GET /api/admin/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📸 Image Upload (S3)

### Method 1: Pre-signed URL (Recommended)

**Step 1:** Get upload URL
```bash
GET /api/admin/upload-url?fileName=product.jpg&fileType=image/jpeg
Authorization: Bearer <token>
```

**Response:**
```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/...",
  "fileUrl": "https://bucket.s3.amazonaws.com/products/uuid.jpg"
}
```

**Step 2:** Upload directly to S3
```bash
PUT <uploadUrl>
Content-Type: image/jpeg

<binary file data>
```

**Step 3:** Use fileUrl in product creation

### Method 2: Direct Upload

```bash
POST /api/admin/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

## 📈 Analytics

```bash
GET /api/admin/stats
Authorization: Bearer <token>
```

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
  "topProducts": [...],
  "revenueByDay": [...],
  "recentActivity": {...}
}
```

## 🔄 Migration from LocalStorage

Your existing frontend code using `AmberAPI` can be easily migrated:

**Before (localStorage):**
```javascript
async getProducts(params) {
  const products = this._getProducts(); // localStorage
  // filter and return
}
```

**After (REST API):**
```javascript
async getProducts(params) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/products?${queryString}`);
  return await response.json();
}
```

## 🛠️ Development

### Create Admin User

```javascript
const User = require('./models/User');

const admin = new User({
  name: 'Admin',
  email: 'admin@example.com',
  password: 'securepassword',
  role: 'admin'
});

await admin.save();
```

### Seed Database

```bash
npm run seed
```

### Run Tests

```bash
npm test
```

## 🔒 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection protection (MongoDB)
- ✅ XSS protection

## 📦 Dependencies

**Core:**
- express - Web framework
- mongoose - MongoDB ODM
- cors - Cross-origin resource sharing
- helmet - Security headers
- dotenv - Environment variables

**Authentication:**
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- express-rate-limit - Rate limiting

**File Upload:**
- multer - Multipart form data
- multer-s3 - S3 integration
- aws-sdk - AWS services
- uuid - Unique identifiers

## 🚢 Deployment

### Heroku

```bash
heroku create amber-atelier-api
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### DigitalOcean

```bash
# Use App Platform or Droplets
# Configure environment variables
# Set up PM2 for process management
```

### AWS EC2

```bash
# Install Node.js and MongoDB
# Clone repo and npm install
# Use PM2 or systemd for process management
# Configure nginx as reverse proxy
```

## 🔍 Monitoring

Add monitoring services:
- **New Relic** - Performance monitoring
- **Sentry** - Error tracking
- **DataDog** - Infrastructure monitoring
- **MongoDB Atlas** - Database monitoring

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 💡 Next Steps

1. Set up production database (MongoDB Atlas)
2. Configure AWS S3 or Cloudinary for images
3. Add payment integration (Razorpay/Stripe)
4. Implement email notifications
5. Add Redis for caching
6. Set up CI/CD pipeline
7. Configure domain and SSL
8. Add comprehensive logging
9. Implement backup strategy
10. Load testing and optimization

## 📄 License

MIT
