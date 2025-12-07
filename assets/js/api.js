// API Layer - localStorage-based implementation
// Can be replaced with real REST API calls later

const API = {
    baseURL: '/api',
    
    // Helper methods
    _getProducts() {
        return JSON.parse(localStorage.getItem('amberProducts') || '[]');
    },
    
    _saveProducts(products) {
        localStorage.setItem('amberProducts', JSON.stringify(products));
    },
    
    _getCategories() {
        return JSON.parse(localStorage.getItem('amberCategories') || '[]');
    },
    
    _saveCategories(categories) {
        localStorage.setItem('amberCategories', JSON.stringify(categories));
    },
    
    _getAuth() {
        return JSON.parse(localStorage.getItem('adminAuth') || '{}');
    },
    
    _isAuthenticated() {
        const auth = this._getAuth();
        if (!auth.authenticated || !auth.sessionStart) return false;
        
        const now = Date.now();
        const sessionTimeout = 3600000; // 1 hour
        return (now - auth.sessionStart) < sessionTimeout;
    },
    
    _requireAuth() {
        if (!this._isAuthenticated()) {
            throw new Error('Unauthorized: Authentication required');
        }
    },
    
    // Public Endpoints
    
    /**
     * GET /api/products
     * List products with pagination and filters
     * @param {Object} params - { page, limit, category, minPrice, maxPrice, search, sortBy }
     * @returns {Promise<{data: Array, total: number, page: number, pages: number}>}
     */
    async getProducts(params = {}) {
        const {
            page = 1,
            limit = 12,
            category = null,
            minPrice = 0,
            maxPrice = Infinity,
            search = '',
            sortBy = 'featured'
        } = params;
        
        let products = this._getProducts();
        
        // Filter only active products with stock for public
        products = products.filter(p => {
            const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
            return (p.active !== false) && stock > 0;
        });
        
        // Apply filters
        if (category) {
            products = products.filter(p => {
                const productName = (p.title || p.name || '').toLowerCase();
                return productName.includes(category.toLowerCase());
            });
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p => {
                const title = (p.title || p.name || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                return title.includes(searchLower) || desc.includes(searchLower);
            });
        }
        
        products = products.filter(p => {
            const price = p.price || 0;
            return price >= minPrice && price <= maxPrice;
        });
        
        // Sort
        switch (sortBy) {
            case 'price-asc':
                products.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                products.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name':
                products.sort((a, b) => {
                    const nameA = (a.title || a.name || '').toLowerCase();
                    const nameB = (b.title || b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'newest':
                products.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                break;
            default: // featured
                break;
        }
        
        // Paginate
        const total = products.length;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paginatedProducts = products.slice(start, start + limit);
        
        return {
            data: paginatedProducts,
            total,
            page,
            pages,
            limit
        };
    },
    
    /**
     * GET /api/products/:slug
     * Get single product by slug
     * @param {string} slug - Product slug
     * @returns {Promise<Object>}
     */
    async getProductBySlug(slug) {
        const products = this._getProducts();
        const product = products.find(p => {
            const productSlug = p.slug || this._generateSlug(p.title || p.name || '');
            return productSlug === slug;
        });
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        const stock = product.inventory?.stock_count ?? product.quantity ?? 0;
        if (product.active === false || stock === 0) {
            throw new Error('Product not available');
        }
        
        return product;
    },
    
    /**
     * GET /api/categories
     * Get all categories
     * @returns {Promise<Array>}
     */
    async getCategories() {
        return this._getCategories();
    },
    
    // Admin Endpoints (require authentication)
    
    /**
     * POST /api/admin/products
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>}
     */
    async createProduct(productData) {
        this._requireAuth();
        
        const products = this._getProducts();
        const newProduct = {
            id: Date.now(),
            title: productData.title || '',
            slug: this._generateSlug(productData.title || ''),
            description: productData.description || '',
            price: parseFloat(productData.price) || 0,
            sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
            categories: productData.categories || [],
            tags: productData.tags || [],
            images: productData.images || [],
            inventory: {
                sku: this._generateSKU(),
                stock_count: parseInt(productData.stock_count) || 0
            },
            attributes: productData.attributes || [],
            active: productData.active !== false,
            lowStockThreshold: parseInt(productData.lowStockThreshold) || 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Legacy fields
            name: productData.title || '',
            quantity: parseInt(productData.stock_count) || 0,
            image: productData.images?.[0]?.url || '',
            metal: productData.attributes?.find(a => a.name === 'metal')?.value || '',
            gemstone: productData.attributes?.find(a => a.name === 'gemstone')?.value || ''
        };
        
        products.push(newProduct);
        this._saveProducts(products);
        
        return newProduct;
    },
    
    /**
     * PUT /api/admin/products/:id
     * Update product
     * @param {number} id - Product ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>}
     */
    async updateProduct(id, updates) {
        this._requireAuth();
        
        const products = this._getProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Product not found');
        }
        
        const product = products[index];
        
        // Update fields
        if (updates.title) {
            product.title = updates.title;
            product.slug = this._generateSlug(updates.title);
            product.name = updates.title; // Legacy
        }
        if (updates.description !== undefined) product.description = updates.description;
        if (updates.price !== undefined) product.price = parseFloat(updates.price);
        if (updates.sale_price !== undefined) product.sale_price = updates.sale_price ? parseFloat(updates.sale_price) : null;
        if (updates.categories) product.categories = updates.categories;
        if (updates.tags) product.tags = updates.tags;
        if (updates.images) product.images = updates.images;
        if (updates.attributes) product.attributes = updates.attributes;
        if (updates.active !== undefined) product.active = updates.active;
        if (updates.lowStockThreshold !== undefined) product.lowStockThreshold = parseInt(updates.lowStockThreshold);
        
        if (updates.stock_count !== undefined) {
            if (!product.inventory) product.inventory = { sku: this._generateSKU() };
            product.inventory.stock_count = parseInt(updates.stock_count);
            product.quantity = parseInt(updates.stock_count); // Legacy
        }
        
        product.updatedAt = new Date().toISOString();
        
        // Update legacy fields
        if (updates.images?.[0]?.url) product.image = updates.images[0].url;
        if (updates.attributes) {
            product.metal = updates.attributes.find(a => a.name === 'metal')?.value || '';
            product.gemstone = updates.attributes.find(a => a.name === 'gemstone')?.value || '';
        }
        
        products[index] = product;
        this._saveProducts(products);
        
        return product;
    },
    
    /**
     * DELETE /api/admin/products/:id
     * Delete product
     * @param {number} id - Product ID
     * @returns {Promise<boolean>}
     */
    async deleteProduct(id) {
        this._requireAuth();
        
        const products = this._getProducts();
        const filtered = products.filter(p => p.id !== id);
        
        if (filtered.length === products.length) {
            throw new Error('Product not found');
        }
        
        this._saveProducts(filtered);
        return true;
    },
    
    /**
     * GET /api/admin/products
     * Get all products (including inactive and out of stock)
     * @param {Object} params - { includeInactive, stockStatus }
     * @returns {Promise<Array>}
     */
    async getAdminProducts(params = {}) {
        this._requireAuth();
        
        let products = this._getProducts();
        
        if (!params.includeInactive) {
            products = products.filter(p => p.active !== false);
        }
        
        if (params.stockStatus) {
            products = products.filter(p => {
                const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
                const threshold = p.lowStockThreshold ?? 3;
                
                switch (params.stockStatus) {
                    case 'in-stock':
                        return stock > threshold;
                    case 'low':
                        return stock > 0 && stock <= threshold;
                    case 'out':
                        return stock === 0;
                    default:
                        return true;
                }
            });
        }
        
        return products;
    },
    
    /**
     * POST /api/admin/upload
     * Upload image (simulated - converts to base64)
     * @param {File} file - Image file
     * @returns {Promise<{url: string}>}
     */
    async uploadImage(file) {
        this._requireAuth();
        
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid image file'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({ url: e.target.result });
            };
            reader.onerror = () => {
                reject(new Error('Failed to read image file'));
            };
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * POST /api/auth/login
     * Admin login
     * @param {Object} credentials - { email, password }
     * @returns {Promise<{token: string, user: Object}>}
     */
    async login(credentials) {
        const { email, password } = credentials;
        
        // Hardcoded admin credentials (should be in backend in production)
        // Admin credentials are now managed through backend authentication
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const authData = {
                authenticated: true,
                email: email,
                sessionStart: Date.now(),
                token: this._generateToken() // Simulated JWT
            };
            
            localStorage.setItem('adminAuth', JSON.stringify(authData));
            
            return {
                token: authData.token,
                user: {
                    email: email,
                    role: 'admin'
                }
            };
        }
        
        throw new Error('Invalid credentials');
    },
    
    /**
     * GET /api/admin/stats
     * Get basic analytics
     * @returns {Promise<Object>}
     */
    async getStats() {
        this._requireAuth();
        
        const products = this._getProducts();
        const orders = JSON.parse(localStorage.getItem('amberOrders') || '[]');
        
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.active !== false).length;
        const inStockProducts = products.filter(p => {
            const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
            return stock > 0;
        }).length;
        
        const lowStockProducts = products.filter(p => {
            const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
            const threshold = p.lowStockThreshold ?? 3;
            return stock > 0 && stock <= threshold;
        }).length;
        
        const outOfStockProducts = products.filter(p => {
            const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
            return stock === 0;
        }).length;
        
        const totalInventoryValue = products.reduce((sum, p) => {
            const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
            const price = p.price || 0;
            return sum + (stock * price);
        }, 0);
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        
        // Recent activity
        const recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        const recentProducts = products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        return {
            inventory: {
                total: totalProducts,
                active: activeProducts,
                inStock: inStockProducts,
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
                totalValue: totalInventoryValue
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                totalRevenue
            },
            recentActivity: {
                orders: recentOrders,
                products: recentProducts
            }
        };
    },
    
    // Helper methods
    _generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },
    
    _generateSKU() {
        const prefix = 'AMB';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    },
    
    _generateToken() {
        // Simulated JWT token
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
               btoa(JSON.stringify({ 
                   email: 'shirshakmondaljspbuet@gmail.com',
                   role: 'admin',
                   iat: Date.now()
               }));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Make available globally
window.AmberAPI = API;
