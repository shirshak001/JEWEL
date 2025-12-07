# Admin Setup Guide

## Creating Admin User on Render

The admin panel has been updated to use the backend API with JWT authentication. To use it, you need to create an admin user in the MongoDB database.

### Option 1: Using Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service: `jewel-b1ic`
3. Click on "Shell" in the left sidebar
4. Run this command:
   ```bash
   node scripts/createAdmin.js
   ```
5. You should see: "✅ Admin created successfully!"

### Option 2: Using Local Setup

If you have the backend running locally:

1. Open terminal in the `server-starter` directory
2. Make sure your `.env` file has the correct MongoDB URI
3. Run:
   ```bash
   node scripts/createAdmin.js
   ```

## Admin Credentials

After creating the admin user, you can login with:
- **Email**: `shirshakmondaljspbuet@gmail.com`
- **Password**: `Mondal@2003`
- **Login URL**: https://amber-ecru.vercel.app/admin/login.html (or `/admin/login.html` locally)

## How It Works

### Authentication Flow
1. Admin logs in at `/admin/login.html`
2. Backend validates credentials and returns a JWT token
3. Token is stored in localStorage
4. All subsequent API calls include the token in the `Authorization` header
5. Token is valid for 7 days

### Product Operations
All product operations now go through the backend API:
- **Add Product**: `POST /api/admin/products`
- **Update Product**: `PUT /api/admin/products/:id`
- **Delete Product**: `DELETE /api/admin/products/:id`
- **View Products**: `GET /api/products` (public, no auth required)

## Troubleshooting

### "Invalid credentials" error
- Make sure you've run the `createAdmin.js` script
- Check that MongoDB is connected (look at Render logs)
- Verify the credentials match exactly

### Products not syncing
- Check browser console for API errors
- Verify backend is running: https://jewel-b1ic.onrender.com/api/products
- Make sure JWT token is stored (check localStorage in browser dev tools)

### CORS errors
- Verify CORS_ORIGIN environment variable on Render includes your frontend URL
- Should be: `http://localhost:8000,https://amber-ecru.vercel.app,https://jewel-b1ic.onrender.com`

## Testing the Integration

1. **Login Test**:
   - Go to `/admin/login.html`
   - Enter credentials
   - Should redirect to dashboard

2. **Add Product Test**:
   - Add a product in the admin dashboard
   - Check browser console - should see POST request to `/api/admin/products`
   - Refresh the page - product should still be there (stored in MongoDB)

3. **Cross-Device Test**:
   - Add a product on desktop
   - Open the site on mobile
   - Product should appear on mobile (synced via MongoDB)

4. **Customer View Test**:
   - Add products via admin panel
   - Go to homepage (customer view)
   - Products should display with stock levels

## Next Steps

If everything is working:
- ✅ Admin can log in
- ✅ Products can be added/edited/deleted
- ✅ Products appear on customer site
- ✅ Changes sync across all devices

You're all set! The admin panel is now fully integrated with the backend.
