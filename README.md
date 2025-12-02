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
2. Default credentials:
   - Email: `shirshakmondaljspbuet@gmail.com`
   - Password: `Mondal@2003`
3. Session-based authentication with 1-hour timeout
4. Access the inventory dashboard to:
   - Add new products with images, descriptions, and pricing
   - Set initial stock quantities and low-stock thresholds
   - Edit existing products and update quantities
   - Monitor stock alerts in real-time
   - Delete discontinued items
5. All changes automatically sync to customer site in real-time

## Authentication & Security

### Enhanced Features
- **Password Hashing**: SHA-256 password hashing (use bcrypt in production)
- **Session Management**: 1-hour session timeout with auto-renewal on activity
- **Session Validation**: Each page load validates and extends active sessions
- **Secure Logout**: Confirmation prompt and complete session cleanup
- **Input Validation**: Email and password field validation before submission
- **Auto-redirect**: Logged-in users automatically redirected from login page

## How Inventory Works

### Adding Products
1. Go to "Add Product" in admin dashboard
2. Fill in product details (name, price, description, metal, gemstone)
3. Upload product image
4. Set initial stock quantity
5. Set low stock threshold (when warnings appear)
6. Products immediately appear on customer site

### Stock Management
- **Available**: Quantity above threshold - shows normally to customers
- **Low Stock**: Quantity at or below threshold - shows warning banner to customers
- **Out of Stock**: Quantity = 0 - hidden from customer site, alerts admin

### Automatic Features
- Stock levels stored in browser localStorage
- No backend server required (perfect for static hosting)
- Customer site automatically pulls latest inventory
- Warnings update in real-time on both admin and customer sides
- Admin dashboard shows alert badges for items needing attention

## Customisation Tips
- Update the colour system in `:root` within `assets/css/styles.css` and `assets/css/admin.css`
- Change admin credentials in `assets/js/admin-auth.js`
- Modify default low-stock threshold in Settings panel
- Swap typography by modifying the `@import` statement at the top of stylesheets
- For production: replace localStorage with a proper backend API

## Security Note
This implementation uses localStorage and client-side authentication for demonstration. For production deployment:
- **Backend Required**: Implement proper server-side authentication with JWT or session cookies
- **Database**: Store products in a database (PostgreSQL, MongoDB, etc.)
- **Password Security**: Use bcrypt or Argon2 for password hashing on the server
- **API Security**: Create RESTful API endpoints with authentication middleware
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement login attempt rate limiting
- **Image Hosting**: Use cloud storage (AWS S3, Cloudinary) for product images
- **Validation**: Server-side validation for all inputs
- **CORS**: Configure proper CORS policies for API access
