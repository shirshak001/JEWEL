// Admin Dashboard Logic
let products = [];
let currentFilter = "all";
let searchTerm = "";

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
    const stored = localStorage.getItem("amberProducts");
    if (stored) {
        products = JSON.parse(stored);
    } else {
        // Initialize with empty inventory
        products = [];
    }
    renderInventory();
    renderAlerts();
}

function saveProducts() {
    localStorage.setItem("amberProducts", JSON.stringify(products));
    updateAlertCount();
}

// Render inventory grid
function renderInventory() {
    const grid = document.getElementById("inventory-grid");
    let filtered = products.filter(p => {
        const matchesFilter = currentFilter === "all" ||
            (currentFilter === "low" && p.quantity > 0 && p.quantity <= p.lowStockThreshold) ||
            (currentFilter === "out" && p.quantity === 0) ||
            (currentFilter === "available" && p.quantity > p.lowStockThreshold);

        const matchesSearch = searchTerm === "" ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">No products found.</p>';
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const stockStatus = product.quantity === 0 ? "out" :
            product.quantity <= product.lowStockThreshold ? "low" : "available";

        const stockClass = product.quantity === 0 ? "out-of-stock" :
            product.quantity <= product.lowStockThreshold ? "low-stock" : "";

        return `
            <div class="inventory-card ${stockClass}" data-id="${product.id}">
                <div class="inventory-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : 
                    '<span class="placeholder">No Image</span>'}
                    <span class="stock-badge ${stockStatus}">${stockStatus === "out" ? "Out of Stock" : 
                        stockStatus === "low" ? "Low Stock" : "In Stock"}</span>
                </div>
                <div class="inventory-body">
                    <h3>${product.name}</h3>
                    <div class="inventory-price">₹${product.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="inventory-stock">Quantity: ${product.quantity}</div>
                    <div class="inventory-actions">
                        <button class="btn-icon" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-icon delete" onclick="deleteProduct(${product.id})">Delete</button>
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

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const feedback = form.querySelector(".form-feedback");

        const imageFile = imageInput.files[0];
        let imageData = "";

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageData = event.target.result;
                addProduct(imageData, feedback);
            };
            reader.readAsDataURL(imageFile);
        } else {
            addProduct(imageData, feedback);
        }
    });
}

function addProduct(imageData, feedback) {
    const newProduct = {
        id: Date.now(),
        title: document.getElementById("product-name").value,
        slug: generateSlug(document.getElementById("product-name").value),
        description: document.getElementById("product-description").value,
        price: parseFloat(document.getElementById("product-price").value),
        sale_price: null,
        categories: [],
        tags: [],
        images: imageData ? [{
            url: imageData,
            alt: document.getElementById("product-name").value,
            is_primary: true
        }] : [],
        inventory: {
            sku: generateSKU(),
            stock_count: parseInt(document.getElementById("product-quantity").value)
        },
        attributes: [
            { name: "metal", value: document.getElementById("product-metal").value },
            { name: "gemstone", value: document.getElementById("product-gemstone").value || "" }
        ],
        active: true,
        lowStockThreshold: parseInt(document.getElementById("product-low-stock").value),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Legacy fields for backward compatibility
        name: document.getElementById("product-name").value,
        metal: document.getElementById("product-metal").value,
        gemstone: document.getElementById("product-gemstone").value || "",
        quantity: parseInt(document.getElementById("product-quantity").value),
        image: imageData
    };

    products.push(newProduct);
    saveProducts();
    renderInventory();
    renderAlerts();

    feedback.textContent = "Product added successfully!";
    feedback.dataset.state = "success";

    document.getElementById("add-product-form").reset();
    document.getElementById("image-preview").innerHTML = "";

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

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById("edit-product-id").value);
        const product = products.find(p => p.id === id);

        if (product) {
            const newName = document.getElementById("edit-product-name").value;
            const newPrice = parseFloat(document.getElementById("edit-product-price").value);
            const newQuantity = parseInt(document.getElementById("edit-product-quantity").value);
            const newDescription = document.getElementById("edit-product-description").value;
            
            // Update new model fields
            product.title = newName;
            product.slug = generateSlug(newName);
            product.price = newPrice;
            product.description = newDescription;
            if (product.inventory) {
                product.inventory.stock_count = newQuantity;
            }
            product.updatedAt = new Date().toISOString();
            
            // Update legacy fields for backward compatibility
            product.name = newName;
            product.quantity = newQuantity;

            saveProducts();
            renderInventory();
            renderAlerts();
            modal.classList.remove("active");
        }
    });
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("edit-product-id").value = product.id;
    document.getElementById("edit-product-name").value = product.title || product.name || "";
    document.getElementById("edit-product-price").value = product.price || 0;
    document.getElementById("edit-product-quantity").value = product.inventory?.stock_count ?? product.quantity ?? 0;
    document.getElementById("edit-product-description").value = product.description || "";

    document.getElementById("edit-modal").classList.add("active");
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderInventory();
        renderAlerts();
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

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card ${alert.level}">
            <div class="alert-info">
                <h4>${alert.product.title || alert.product.name}</h4>
                <p>${alert.message}</p>
            </div>
            <button class="btn-icon" onclick="editProduct(${alert.product.id})">Update Stock</button>
        </div>
    `).join("");
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
