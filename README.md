# SoilBuddy Atelier

Premium single-page website concept for a luxury jewellery house with integrated admin inventory management system. The layout emphasises craftsmanship, sustainable sourcing, and concierge services while maintaining an elegant, modern aesthetic.

## Features

### Customer Site
- Hero section with premium typography, layered backgrounds, and consultation call to action
- Dynamic collections grid that pulls from admin inventory with real-time stock warnings
- Story-driven about section with conscious material sourcing highlights
- Client testimonial showcase and accessible contact form with inline feedback
- Responsive navigation, sticky header, reveal animations, and back-to-top control
- Automatic "Low Stock" warnings when inventory is running low
- Out-of-stock items are hidden from customers automatically

### Admin Portal
- Secure login system (separate from customer site at `/admin/login.html`)
- Full inventory dashboard with add/edit/delete product functionality
- Image upload support for product photos
- Automatic stock level tracking and alerts
- Low stock threshold configuration per product
- Stock filtering (all, low stock, out of stock, available)
- Real-time warnings on dashboard when products need restocking
- Products automatically sync to customer site

## Structure
```
index.html                  Main customer landing page
admin/
  login.html               Admin authentication page
  dashboard.html           Admin inventory management dashboard
assets/
  css/
    styles.css             Customer site styling
    admin.css              Admin portal styling
  js/
    main.js                Customer site interactions
    customer-inventory.js  Syncs admin inventory to customer display
    admin-auth.js          Admin login handling
    admin-dashboard.js     Inventory management logic
  images/                  Product images uploaded via admin
```

## Usage

### For Customers
1. Open `index.html` to browse available jewelry
2. Products display with stock warnings when quantities are low
3. Out-of-stock items are automatically hidden

### For Administrators
1. Navigate to `/admin/login.html`
2. Login credentials:
   - Email: `shirshakmondaljspbuet@gmail.com`
   - Password: `Mondal@2003`
3. JWT-based authentication with 7-day token expiry
4. Access the inventory dashboard to:
   - Add new products with images, descriptions, and pricing
   - Set initial stock quantities and low-stock thresholds
   - Edit existing products and update quantities
   - Monitor stock alerts in real-time
   - Delete discontinued items
5. All changes are saved to MongoDB and sync across all devices in real-time

## Authentication & Security

### Backend Integration
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **MongoDB Database**: Products stored in MongoDB Atlas cloud database
- **API Endpoints**: RESTful API with role-based access control
- **Password Security**: bcrypt password hashing on server-side
- **Authorization**: Bearer token authentication for admin routes
- **Session Management**: Token stored in localStorage for persistent login

### API Endpoints
- **Public**: `GET /api/products` - View products (no auth required)
- **Admin**: `POST /api/admin/products` - Create product (auth required)
- **Admin**: `PUT /api/admin/products/:id` - Update product (auth required)
- **Admin**: `DELETE /api/admin/products/:id` - Delete product (auth required)
- **Auth**: `POST /api/auth/login` - Admin login

## How Inventory Works

### Adding Products
1. Go to "Add Product" in admin dashboard
2. Fill in product details (name, price, description, metal, gemstone)
3. Upload product image
4. Set initial stock quantity
5. Set low stock threshold (when warnings appear)
6. Product is saved to MongoDB and appears on customer site immediately

### Stock Management
- **Available**: Quantity above threshold - shows normally to customers
- **Low Stock**: Quantity at or below threshold - shows warning banner to customers
- **Out of Stock**: Quantity = 0 - hidden from customer site, alerts admin

### Automatic Features
- Stock levels stored in MongoDB Atlas
- Customer site automatically pulls latest inventory from backend API
- Warnings update in real-time on both admin and customer sides
- Admin dashboard shows alert badges for items needing attention
- Cross-device synchronization - changes appear on all devices

## Deployment

### Backend (Render.com)
- URL: https://jewel-b1ic.onrender.com
- MongoDB Atlas connected
- Environment variables configured (JWT_SECRET, MONGODB_URI, CORS_ORIGIN)
- Automatic deploys from main branch

### Frontend (Vercel)
- URL: https://amber-ecru.vercel.app
- Connected to backend API
- Environment variables: API_URL=https://jewel-b1ic.onrender.com

### Creating Admin User
Run this command in the backend server:
```bash
cd server-starter
node scripts/createAdmin.js
```

## Customisation Tips
- Update the colour system in `:root` within `assets/css/styles.css` and `assets/css/admin.css`
- Modify low-stock thresholds when adding products
- Swap typography by modifying the `@import` statement at the top of stylesheets
- Update backend API URL in `assets/js/config.js`

## Technologies Used

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- EmailJS for contact form
- Razorpay for payment processing

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- Multer for image uploads
