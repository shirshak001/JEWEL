// API Usage Examples
// This file demonstrates how to use the Amber API

// ============================================
// PUBLIC API ENDPOINTS
// ============================================

// Example 1: Get products with pagination and filters
async function exampleGetProducts() {
    try {
        const result = await AmberAPI.getProducts({
            page: 1,
            limit: 12,
            category: 'ring',
            minPrice: 50000,
            maxPrice: 200000,
            search: 'gold',
            sortBy: 'price-asc' // Options: featured, price-asc, price-desc, name, newest
        });
        
        console.log('Products:', result.data);
        console.log(`Page ${result.page} of ${result.pages}`);
        console.log(`Total products: ${result.total}`);
        
        return result;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Example 2: Get single product by slug
async function exampleGetProductBySlug() {
    try {
        const product = await AmberAPI.getProductBySlug('aurora-crown-ring');
        console.log('Product details:', product);
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

// Example 3: Get all categories
async function exampleGetCategories() {
    try {
        const categories = await AmberAPI.getCategories();
        console.log('Categories:', categories);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// ============================================
// ADMIN API ENDPOINTS (Require Authentication)
// ============================================

// Example 4: Admin login
async function exampleLogin() {
    try {
        const response = await AmberAPI.login({
            email: 'your-admin@email.com',
            password: 'your-password'
        });
        
        console.log('Login successful:', response);
        console.log('Token:', response.token);
        return response;
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Example 5: Create new product
async function exampleCreateProduct() {
    try {
        const newProduct = await AmberAPI.createProduct({
            title: 'Diamond Eternity Ring',
            description: 'Stunning eternity ring with brilliant cut diamonds',
            price: 185000,
            sale_price: null,
            categories: [],
            tags: ['rings', 'diamond', 'luxury'],
            images: [{
                url: 'data:image/jpeg;base64,...', // Base64 encoded image
                alt: 'Diamond Eternity Ring',
                is_primary: true
            }],
            stock_count: 8,
            attributes: [
                { name: 'metal', value: '18k White Gold' },
                { name: 'gemstone', value: 'Diamond' },
                { name: 'carat', value: '2.5' }
            ],
            active: true,
            lowStockThreshold: 3
        });
        
        console.log('Product created:', newProduct);
        return newProduct;
    } catch (error) {
        console.error('Error creating product:', error);
    }
}

// Example 6: Update product
async function exampleUpdateProduct(productId) {
    try {
        const updated = await AmberAPI.updateProduct(productId, {
            title: 'Diamond Eternity Ring - Updated',
            price: 175000,
            sale_price: 165000,
            stock_count: 10,
            active: true
        });
        
        console.log('Product updated:', updated);
        return updated;
    } catch (error) {
        console.error('Error updating product:', error);
    }
}

// Example 7: Delete product
async function exampleDeleteProduct(productId) {
    try {
        const result = await AmberAPI.deleteProduct(productId);
        console.log('Product deleted:', result);
        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Example 8: Get admin products with filters
async function exampleGetAdminProducts() {
    try {
        // Get all products including inactive
        const allProducts = await AmberAPI.getAdminProducts({
            includeInactive: true
        });
        
        // Get only low stock products
        const lowStockProducts = await AmberAPI.getAdminProducts({
            stockStatus: 'low'
        });
        
        // Get out of stock products
        const outOfStockProducts = await AmberAPI.getAdminProducts({
            stockStatus: 'out'
        });
        
        console.log('All products:', allProducts.length);
        console.log('Low stock:', lowStockProducts.length);
        console.log('Out of stock:', outOfStockProducts.length);
        
        return { allProducts, lowStockProducts, outOfStockProducts };
    } catch (error) {
        console.error('Error fetching admin products:', error);
    }
}

// Example 9: Upload image
async function exampleUploadImage(fileInput) {
    try {
        const file = fileInput.files[0];
        const result = await AmberAPI.uploadImage(file);
        console.log('Image uploaded:', result.url);
        return result;
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

// Example 10: Get admin statistics
async function exampleGetStats() {
    try {
        const stats = await AmberAPI.getStats();
        
        console.log('=== INVENTORY STATS ===');
        console.log('Total Products:', stats.inventory.total);
        console.log('Active Products:', stats.inventory.active);
        console.log('In Stock:', stats.inventory.inStock);
        console.log('Low Stock:', stats.inventory.lowStock);
        console.log('Out of Stock:', stats.inventory.outOfStock);
        console.log('Total Inventory Value: ₹', stats.inventory.totalValue.toLocaleString('en-IN'));
        
        console.log('\n=== ORDER STATS ===');
        console.log('Total Orders:', stats.orders.total);
        console.log('Pending Orders:', stats.orders.pending);
        console.log('Completed Orders:', stats.orders.completed);
        console.log('Total Revenue: ₹', stats.orders.totalRevenue.toLocaleString('en-IN'));
        
        console.log('\n=== RECENT ACTIVITY ===');
        console.log('Recent Orders:', stats.recentActivity.orders);
        console.log('Recent Products:', stats.recentActivity.products);
        
        return stats;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// ============================================
// PRACTICAL USAGE PATTERNS
// ============================================

// Pattern 1: Building a product listing page
async function buildProductListing(page = 1, filters = {}) {
    const products = await AmberAPI.getProducts({
        page,
        limit: 12,
        ...filters
    });
    
    // Render products in your HTML
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.data.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.images?.[0]?.url || product.image}" alt="${product.title || product.name}">
            <h3>${product.title || product.name}</h3>
            <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
        </div>
    `).join('');
    
    // Render pagination
    renderPagination(products.page, products.pages);
}

// Pattern 2: Admin dashboard with stats
async function buildAdminDashboard() {
    const stats = await AmberAPI.getStats();
    
    // Update dashboard UI
    document.getElementById('total-products').textContent = stats.inventory.total;
    document.getElementById('low-stock-count').textContent = stats.inventory.lowStock;
    document.getElementById('total-revenue').textContent = '₹' + stats.orders.totalRevenue.toLocaleString('en-IN');
    document.getElementById('pending-orders').textContent = stats.orders.pending;
}

// Pattern 3: Search functionality
async function searchProducts(searchTerm) {
    const results = await AmberAPI.getProducts({
        search: searchTerm,
        limit: 20
    });
    
    displaySearchResults(results.data);
}

// Pattern 4: Protected admin action
async function performAdminAction() {
    try {
        // This will throw error if not authenticated
        const products = await AmberAPI.getAdminProducts();
        // ... do something with products
    } catch (error) {
        if (error.message === 'Unauthorized: Authentication required') {
            // Redirect to login
            window.location.href = '/admin/login.html';
        }
    }
}

// Pattern 5: Form submission for new product
async function handleProductForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const imageFile = formData.get('image');
    
    // Upload image first
    const imageResult = await AmberAPI.uploadImage(imageFile);
    
    // Create product with uploaded image
    const product = await AmberAPI.createProduct({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        stock_count: formData.get('quantity'),
        images: [{
            url: imageResult.url,
            alt: formData.get('title'),
            is_primary: true
        }],
        attributes: [
            { name: 'metal', value: formData.get('metal') },
            { name: 'gemstone', value: formData.get('gemstone') }
        ]
    });
    
    alert('Product created successfully!');
    return product;
}

// Helper function to render pagination
function renderPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
        pages.push(`
            <button 
                class="page-btn ${i === currentPage ? 'active' : ''}" 
                onclick="buildProductListing(${i})">
                ${i}
            </button>
        `);
    }
    
    paginationContainer.innerHTML = pages.join('');
}

function displaySearchResults(products) {
    // Implement your search results display logic
    console.log('Search results:', products);
}

// Export examples for testing
if (typeof window !== 'undefined') {
    window.APIExamples = {
        exampleGetProducts,
        exampleGetProductBySlug,
        exampleGetCategories,
        exampleLogin,
        exampleCreateProduct,
        exampleUpdateProduct,
        exampleDeleteProduct,
        exampleGetAdminProducts,
        exampleUploadImage,
        exampleGetStats,
        buildProductListing,
        buildAdminDashboard,
        searchProducts
    };
}
