// Admin Dashboard Logic
let products = [];
let currentFilter = "all";
let searchTerm = "";

const API_URL = window.APP_CONFIG?.API_URL || 'https://jewel-b1ic.onrender.com';

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem("adminToken");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Check authentication with session validation
function validateSession() {
    const authData = JSON.parse(localStorage.getItem("adminAuth") || "{}");
    const now = Date.now();
    const sessionTimeout = 3600000; // 1 hour
    
    if (authData.authenticated && authData.sessionStart) {
        const elapsed = now - authData.sessionStart;
        if (elapsed < sessionTimeout) {
            // Extend session
            authData.sessionStart = now;
            localStorage.setItem("adminAuth", JSON.stringify(authData));
            return authData;
        }
    }
    
    // Invalid or expired session
    localStorage.removeItem("adminAuth");
    window.location.href = "login.html";
    return null;
}

const sessionData = validateSession();
if (!sessionData) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    initializeNavigation();
    initializeProductForm();
    initializeEditModal();
    initializeFilters();
    updateAlertCount();

    // Display admin info from session
    if (sessionData && sessionData.email) {
        document.getElementById("admin-name").textContent = sessionData.email;
    }

    // Logout with session cleanup
    document.getElementById("logout-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("adminAuth");
            localStorage.removeItem("amberProducts");
            window.location.href = "login.html";
        }
    });
});

// Navigation between sections
function initializeNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".dashboard-section");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.getAttribute("href").substring(1) + "-section";

            navItems.forEach(nav => nav.classList.remove("active"));
            sections.forEach(section => section.classList.remove("active"));

            item.classList.add("active");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active");
            }
        });
    });
}

// Load products from localStorage
function loadProducts() {
    // Try to fetch from backend first
    fetchProductsFromBackend();
}

async function fetchProductsFromBackend() {
    try {
        const API_URL = window.APP_CONFIG?.API_URL || 'https://jewel-b1ic.onrender.com';
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Handle different response formats
            if (Array.isArray(data)) {
                products = data;
            } else if (data.products && Array.isArray(data.products)) {
                products = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                products = data.data;
            }
            
            // Also save to localStorage as backup
            if (products.length > 0) {
                localStorage.setItem("amberProducts", JSON.stringify(products));
            }
        } else {
            throw new Error('Failed to fetch from backend');
        }
    } catch (error) {
        console.error('Error fetching products from backend:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem("amberProducts");
        if (stored) {
            products = JSON.parse(stored);
        } else {
            products = [];
        }
    }
    
    renderInventory();
    renderAlerts();
}

async function saveProducts() {
    // Save to localStorage as backup
    localStorage.setItem("amberProducts", JSON.stringify(products));
    updateAlertCount();
    
    // TODO: Implement backend sync when admin API endpoints are ready
    // For now, products are only saved locally
    console.log('Products saved to localStorage. Backend sync not yet implemented.');
}

// Render inventory grid
function renderInventory() {
    const grid = document.getElementById("inventory-grid");
    let filtered = products.filter(p => {
        const stockCount = p.inventory?.stock ?? p.inventory?.stock_count ?? p.quantity ?? 0;
        const threshold = p.lowStockThreshold || 5;
        
        const matchesFilter = currentFilter === "all" ||
            (currentFilter === "low" && stockCount > 0 && stockCount <= threshold) ||
            (currentFilter === "out" && stockCount === 0) ||
            (currentFilter === "available" && stockCount > threshold);

        const productName = p.title || p.name || "";
        const matchesSearch = searchTerm === "" ||
            productName.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">No products found.</p>';
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const productId = product._id || product.id;
        const productName = product.title || product.name || "Unnamed Product";
        const productPrice = product.price || 0;
        const stockCount = product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold || 5;
        const productImage = product.images?.[0]?.url || product.image || "";
        
        const stockStatus = stockCount === 0 ? "out" :
            stockCount <= threshold ? "low" : "available";

        const stockClass = stockCount === 0 ? "out-of-stock" :
            stockCount <= threshold ? "low-stock" : "";

        return `
            <div class="inventory-card ${stockClass}" data-id="${productId}">
                <div class="inventory-image">
                    ${productImage ? `<img src="${productImage}" alt="${productName}">` : 
                    '<span class="placeholder">No Image</span>'}
                    <span class="stock-badge ${stockStatus}">${stockStatus === "out" ? "Out of Stock" : 
                        stockStatus === "low" ? "Low Stock" : "In Stock"}</span>
                </div>
                <div class="inventory-body">
                    <h3>${productName}</h3>
                    <div class="inventory-price">₹${productPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="inventory-stock">Quantity: ${stockCount}</div>
                    <div class="inventory-actions">
                        <button class="btn-icon" onclick="editProduct('${productId}')">Edit</button>
                        <button class="btn-icon delete" onclick="deleteProduct('${productId}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Initialize add product form
function initializeProductForm() {
    const form = document.getElementById("add-product-form");
    const imageInput = document.getElementById("product-image");
    const preview = document.getElementById("image-preview");

    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const feedback = form.querySelector(".form-feedback");

        const imageFile = imageInput.files[0];
        let imageData = "";

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                imageData = event.target.result;
                await addProduct(imageData, feedback);
            };
            reader.readAsDataURL(imageFile);
        } else {
            await addProduct(imageData, feedback);
        }
    });
}

async function addProduct(imageData, feedback) {
    const newProduct = {
        title: document.getElementById("product-name").value,
        slug: generateSlug(document.getElementById("product-name").value),
        description: document.getElementById("product-description").value,
        price: parseFloat(document.getElementById("product-price").value),
        salePrice: null,
        categories: [],
        tags: [],
        images: imageData ? [{
            url: imageData,
            alt: document.getElementById("product-name").value,
            isPrimary: true
        }] : [],
        inventory: {
            sku: generateSKU(),
            stock: parseInt(document.getElementById("product-quantity").value)
        },
        attributes: [
            { name: "metal", value: document.getElementById("product-metal").value },
            { name: "gemstone", value: document.getElementById("product-gemstone").value || "" }
        ],
        active: true,
        lowStockThreshold: parseInt(document.getElementById("product-low-stock").value)
    };

    try {
        feedback.textContent = "Adding product...";
        feedback.dataset.state = "info";

        const response = await fetch(`${API_URL}/api/admin/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newProduct)
        });

        const data = await response.json();

        if (response.ok) {
            feedback.textContent = "Product added successfully! Refreshing...";
            feedback.dataset.state = "success";

            // Reload all products from backend to ensure sync
            await loadProducts();
            
            renderInventory();
            renderAlerts();

            document.getElementById("add-product-form").reset();
            document.getElementById("image-preview").innerHTML = "";
        } else {
            throw new Error(data.error || 'Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        feedback.textContent = `Error: ${error.message}`;
        feedback.dataset.state = "error";
    }

    setTimeout(() => {
        feedback.textContent = "";
    }, 3000);
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function generateSKU() {
    const prefix = "AMB";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// Edit product modal
function initializeEditModal() {
    const modal = document.getElementById("edit-modal");
    const closeBtn = document.getElementById("close-modal");
    const cancelBtn = document.getElementById("cancel-edit");
    const form = document.getElementById("edit-product-form");

    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const productId = document.getElementById("edit-product-id").value;
        const product = products.find(p => (p._id || p.id) === productId);

        if (product) {
            const newName = document.getElementById("edit-product-name").value;
            const newPrice = parseFloat(document.getElementById("edit-product-price").value);
            const newQuantity = parseInt(document.getElementById("edit-product-quantity").value);
            const newDescription = document.getElementById("edit-product-description").value;
            
            const updatedProduct = {
                title: newName,
                slug: generateSlug(newName),
                price: newPrice,
                description: newDescription,
                inventory: {
                    ...product.inventory,
                    stock: newQuantity
                }
            };

            try {
                const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(updatedProduct)
                });

                const data = await response.json();

                if (response.ok) {
                    // Update local products array
                    const index = products.findIndex(p => (p._id || p.id) === productId);
                    if (index !== -1) {
                        products[index] = data.product || data.data;
                    }

                    renderInventory();
                    renderAlerts();
                    modal.classList.remove("active");
                } else {
                    throw new Error(data.error || 'Failed to update product');
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert(`Error updating product: ${error.message}`);
            }
        }
    });
}

function editProduct(id) {
    const product = products.find(p => (p._id || p.id) === id);
    if (!product) return;

    document.getElementById("edit-product-id").value = product._id || product.id;
    document.getElementById("edit-product-name").value = product.title || product.name || "";
    document.getElementById("edit-product-price").value = product.price || 0;
    document.getElementById("edit-product-quantity").value = product.inventory?.stock ?? product.inventory?.stock_count ?? product.quantity ?? 0;
    document.getElementById("edit-product-description").value = product.description || "";

    document.getElementById("edit-modal").classList.add("active");
}

async function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                // Remove from local products array
                products = products.filter(p => (p._id || p.id) !== id);
                renderInventory();
                renderAlerts();
            } else {
                throw new Error(data.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(`Error deleting product: ${error.message}`);
        }
    }
}

// Filters
function initializeFilters() {
    const stockFilter = document.getElementById("stock-filter");
    const searchInput = document.getElementById("search-products");

    stockFilter.addEventListener("change", (e) => {
        currentFilter = e.target.value;
        renderInventory();
    });

    searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        renderInventory();
    });
}

// Alerts
function renderAlerts() {
    const container = document.getElementById("alerts-container");
    const lowStock = products.filter(p => {
        const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
        const threshold = p.lowStockThreshold ?? 3;
        return stock > 0 && stock <= threshold;
    });
    const outOfStock = products.filter(p => (p.inventory?.stock_count ?? p.quantity ?? 0) === 0);

    const alerts = [
        ...outOfStock.map(p => ({
            product: p,
            level: "critical",
            message: "Out of stock - Customer orders cannot be fulfilled"
        })),
        ...lowStock.map(p => ({
            product: p,
            level: "warning",
            message: `Only ${p.inventory?.stock_count ?? p.quantity ?? 0} units remaining`
        }))
    ];

    if (alerts.length === 0) {
        container.innerHTML = '<p style="color: var(--color-muted);">No stock alerts at this time.</p>';
        return;
    }

    container.innerHTML = alerts.map(alert => {
        const productId = alert.product._id || alert.product.id;
        return `
            <div class="alert-card ${alert.level}">
                <div class="alert-info">
                    <h4>${alert.product.title || alert.product.name}</h4>
                    <p>${alert.message}</p>
                </div>
                <button class="btn-icon" onclick="editProduct('${productId}')">Update Stock</button>
            </div>
        `;
    }).join("");
}

function updateAlertCount() {
    const lowStock = products.filter(p => {
        const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
        const threshold = p.lowStockThreshold ?? 3;
        return stock > 0 && stock <= threshold;
    });
    const outOfStock = products.filter(p => (p.inventory?.stock_count ?? p.quantity ?? 0) === 0);
    const count = lowStock.length + outOfStock.length;
    
    const badge = document.getElementById("alert-count");
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "block" : "none";
    }
}

// Settings
document.getElementById("save-settings")?.addEventListener("click", () => {
    const globalThreshold = document.getElementById("global-low-stock").value;
    localStorage.setItem("globalLowStockThreshold", globalThreshold);
    alert("Settings saved successfully!");
});
