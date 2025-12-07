// Customer-side inventory integration
// This script loads products from admin inventory and displays stock warnings

document.addEventListener("DOMContentLoaded", () => {
    fetchAndLoadProducts();
});

async function fetchAndLoadProducts() {
    try {
        // Get API URL from config
        const API_URL = window.APP_CONFIG?.API_URL || 'https://jewel-b1ic.onrender.com';
        
        console.log('Fetching products from:', `${API_URL}/api/products`);
        
        // Fetch products from backend
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response formats
        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
        } else if (data.data && Array.isArray(data.data)) {
            products = data.data;
        }
        
        console.log('Parsed products:', products.length);
        
        // Store in localStorage for offline access
        if (products.length > 0) {
            localStorage.setItem("amberProducts", JSON.stringify(products));
        }
        
        // Load products on page
        loadHomepageProducts(products);
        loadCustomerProducts(products);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to localStorage if fetch fails
        const stored = localStorage.getItem("amberProducts");
        if (stored) {
            const products = JSON.parse(stored);
            loadHomepageProducts(products);
            loadCustomerProducts(products);
        } else {
            showNoProductsMessage();
        }
    }
}

// Helper functions - defined at top level so they can be used anywhere
function categorizeProduct(product) {
    const name = (product.title || product.name || "").toLowerCase();
    if (name.includes("ring") && !name.includes("earring")) return "rings";
    if (name.includes("earring")) return "earrings";
    if (name.includes("necklace") || name.includes("pendant")) return "necklaces";
    if (name.includes("bracelet") || name.includes("cuff") || name.includes("bangle")) return "bracelets";
    if (name.includes("band")) return "bands";
    return "rings";
}

function determineMetalType(metal) {
    const metalLower = (metal || "").toLowerCase();
    if (metalLower.includes("rose")) return "rose-gold";
    if (metalLower.includes("yellow") || metalLower.includes("champagne")) return "yellow-gold";
    if (metalLower.includes("white")) return "white-gold";
    if (metalLower.includes("platinum")) return "platinum";
    return "yellow-gold";
}

function showNoProductsMessage() {
    const homepageGrid = document.getElementById("homepage-products");
    if (homepageGrid) {
        homepageGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">Unable to load products. Please check your connection.</p>
            </div>
        `;
    }
}

function loadHomepageProducts(products = null) {
    const homepageGrid = document.getElementById("homepage-products");
    if (!homepageGrid) return;

    // If no products passed, try to get from localStorage
    if (!products) {
        const stored = localStorage.getItem("amberProducts");
        if (!stored) {
            homepageGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="color: var(--color-muted); font-size: 1.1rem;">No products available yet. Products added via admin panel will appear here.</p>
                </div>
            `;
            return;
        }
        products = JSON.parse(stored);
    }
    const availableProducts = products.filter(p => {
        const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
        return stock > 0 && (p.active !== false);
    }).slice(0, 6); // Show max 6 on homepage

    if (availableProducts.length === 0) {
        homepageGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">No products currently available. Please check back soon.</p>
            </div>
        `;
        return;
    }

    availableProducts.forEach(product => {
        const stock = product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold ?? 3;
        const isLowStock = stock <= threshold;
        const stockWarning = isLowStock ? 
            `<div class="stock-warning">Only ${stock} left in stock</div>` : "";

        const category = categorizeProduct(product);
        const metal = product.attributes?.find(a => a.name === "metal")?.value || product.metal || "";
        const gemstone = product.attributes?.find(a => a.name === "gemstone")?.value || product.gemstone || "";
        const metalType = determineMetalType(metal);
        const primaryImage = product.images?.find(img => img.is_primary)?.url || product.image || "";
        const productName = product.title || product.name || "Untitled";
        const productDescription = product.description || "";
        const productPrice = product.price ?? 0;

        const card = document.createElement("article");
        card.className = "collection-card reveal";
        card.dataset.category = category;
        card.dataset.metal = metalType;
        card.dataset.price = productPrice;
        
        card.innerHTML = `
            <div class="collection-card__media" style="${primaryImage ? `background-image: url(${primaryImage}); background-size: cover; background-position: center;` : ''}">
                ${!primaryImage ? '<span style="color: var(--color-muted);">Image Coming Soon</span>' : ''}
            </div>
            <div class="collection-card__body">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                ${stockWarning}
                <dl>
                    <div>
                        <dt>Metal</dt>
                        <dd>${metal}</dd>
                    </div>
                    ${gemstone ? `
                    <div>
                        <dt>Gemstone</dt>
                        <dd>${gemstone}</dd>
                    </div>
                    ` : ''}
                </dl>
                <div class="collection-card__footer">
                    <span class="price">₹${productPrice.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    <a class="cta cta-small" href="collection.html">${isLowStock ? "Reserve Now" : "Shop Now"}</a>
                </div>
            </div>
        `;
        homepageGrid.appendChild(card);
    });

    // Re-initialize reveal animations for new elements
    initializeRevealAnimations();
}

function loadCustomerProducts(products = null) {
    const collectionGrid = document.querySelector(".collection-grid:not(#homepage-products)");
    
    if (!collectionGrid) return;

    // If no products passed, try to get from localStorage
    if (!products) {
        const stored = localStorage.getItem("amberProducts");
        if (!stored) return;
        products = JSON.parse(stored);
    }

    // Filter only products that are in stock and active (not out of stock)
    const availableProducts = products.filter(p => {
        const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
        return stock > 0 && (p.active !== false);
    });

    if (availableProducts.length === 0) {
        collectionGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">No products currently available. Please check back soon.</p>
            </div>
        `;
        return;
    }

    availableProducts.forEach(product => {
        const stock = product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold ?? 3;
        const isLowStock = stock <= threshold;
        const stockWarning = isLowStock ? 
            `<div class="stock-warning">Only ${stock} left in stock</div>` : "";

        const category = categorizeProduct(product);
        const metal = product.attributes?.find(a => a.name === "metal")?.value || product.metal || "";
        const gemstone = product.attributes?.find(a => a.name === "gemstone")?.value || product.gemstone || "";
        const metalType = determineMetalType(metal);
        const primaryImage = product.images?.find(img => img.is_primary)?.url || product.image || "";
        const productName = product.title || product.name || "Untitled";
        const productDescription = product.description || "";
        const productPrice = product.price ?? 0;

        const card = document.createElement("article");
        card.className = "collection-card reveal";
        card.dataset.category = category;
        card.dataset.metal = metalType;
        card.dataset.price = productPrice;
        
        card.innerHTML = `
            <div class="collection-card__media" style="${primaryImage ? `background-image: url(${primaryImage}); background-size: cover; background-position: center;` : ''}">
                ${!primaryImage ? '<span style="color: var(--color-muted);">Image Coming Soon</span>' : ''}
            </div>
            <div class="collection-card__body">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                ${stockWarning}
                <dl>
                    <div>
                        <dt>Metal</dt>
                        <dd>${metal}</dd>
                    </div>
                    ${gemstone ? `
                    <div>
                        <dt>Gemstone</dt>
                        <dd>${gemstone}</dd>
                    </div>
                    ` : ''}
                </dl>
                <div class="collection-card__footer">
                    <span class="price">₹${productPrice.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    <a class="text-link" href="#contact">${isLowStock ? "Reserve Now" : "View Details"}</a>
                </div>
            </div>
        `;
        collectionGrid.appendChild(card);
    });

    // Re-initialize reveal animations for new elements
    initializeRevealAnimations();
}

function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal:not(.is-visible)");
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    revealElements.forEach(el => observer.observe(el));
}

// Add stock warning styles if not already present
if (!document.querySelector("#customer-stock-styles")) {
    const style = document.createElement("style");
    style.id = "customer-stock-styles";
    style.textContent = `
        .stock-warning {
            background: linear-gradient(135deg, rgba(242, 184, 75, 0.15), rgba(242, 184, 75, 0.05));
            border: 1px solid rgba(242, 184, 75, 0.3);
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            margin: 0.75rem 0;
            font-size: 0.85rem;
            color: #f2b84b;
            letter-spacing: 0.05em;
            text-align: center;
        }

        .collection-card__media {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}
