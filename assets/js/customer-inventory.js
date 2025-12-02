// Customer-side inventory integration
// This script loads products from admin inventory and displays stock warnings

document.addEventListener("DOMContentLoaded", () => {
    loadHomepageProducts();
    loadCustomerProducts();
});

function loadHomepageProducts() {
    const homepageGrid = document.getElementById("homepage-products");
    if (!homepageGrid) return;

    const stored = localStorage.getItem("amberProducts");
    if (!stored) {
        homepageGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">No products available yet. Products added via admin panel will appear here.</p>
            </div>
        `;
        return;
    }

    const products = JSON.parse(stored);
    const availableProducts = products.filter(p => p.quantity > 0).slice(0, 6); // Show max 6 on homepage

    if (availableProducts.length === 0) {
        homepageGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">No products currently available. Please check back soon.</p>
            </div>
        `;
        return;
    }

    availableProducts.forEach(product => {
        const isLowStock = product.quantity <= product.lowStockThreshold;
        const stockWarning = isLowStock ? 
            `<div class="stock-warning">Only ${product.quantity} left in stock</div>` : "";

        const category = categorizeProduct(product);
        const metalType = determineMetalType(product.metal);

        const card = document.createElement("article");
        card.className = "collection-card reveal";
        card.dataset.category = category;
        card.dataset.metal = metalType;
        card.dataset.price = product.price;
        
        card.innerHTML = `
            <div class="collection-card__media" style="${product.image ? `background-image: url(${product.image}); background-size: cover; background-position: center;` : ''}">
                ${!product.image ? '<span style="color: var(--color-muted);">Image Coming Soon</span>' : ''}
            </div>
            <div class="collection-card__body">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                ${stockWarning}
                <dl>
                    <div>
                        <dt>Metal</dt>
                        <dd>${product.metal}</dd>
                    </div>
                    ${product.gemstone ? `
                    <div>
                        <dt>Gemstone</dt>
                        <dd>${product.gemstone}</dd>
                    </div>
                    ` : ''}
                </dl>
                <div class="collection-card__footer">
                    <span class="price">₹${product.price.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    <a class="cta cta-small" href="collection.html">${isLowStock ? "Reserve Now" : "Shop Now"}</a>
                </div>
            </div>
        `;
        homepageGrid.appendChild(card);
    });

    // Re-initialize reveal animations for new elements
    initializeRevealAnimations();
}

function loadCustomerProducts() {
    const collectionGrid = document.querySelector(".collection-grid:not(#homepage-products)");
    
    if (!collectionGrid) return;

    const stored = localStorage.getItem("amberProducts");
    if (!stored) return;

    const products = JSON.parse(stored);

    // Filter only products that are in stock or low stock (not out of stock)
    const availableProducts = products.filter(p => p.quantity > 0);

    if (availableProducts.length === 0) {
        collectionGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--color-muted); font-size: 1.1rem;">No products currently available. Please check back soon.</p>
            </div>
        `;
        return;
    }

    // Determine category from product name or metal type
    const categorizeProduct = (product) => {
        const name = product.name.toLowerCase();
        if (name.includes("ring")) return "rings";
        if (name.includes("earring")) return "earrings";
        if (name.includes("necklace")) return "necklaces";
        if (name.includes("bracelet") || name.includes("cuff")) return "bracelets";
        if (name.includes("band")) return "bands";
        return "rings";
    };

    const determineMetalType = (metal) => {
        const metalLower = metal.toLowerCase();
        if (metalLower.includes("rose")) return "rose-gold";
        if (metalLower.includes("yellow") || metalLower.includes("champagne")) return "yellow-gold";
        if (metalLower.includes("white")) return "white-gold";
        if (metalLower.includes("platinum")) return "platinum";
        return "yellow-gold";
    };

    availableProducts.forEach(product => {
        const isLowStock = product.quantity <= product.lowStockThreshold;
        const stockWarning = isLowStock ? 
            `<div class="stock-warning">Only ${product.quantity} left in stock</div>` : "";

        const category = categorizeProduct(product);
        const metalType = determineMetalType(product.metal);

        const card = document.createElement("article");
        card.className = "collection-card reveal";
        card.dataset.category = category;
        card.dataset.metal = metalType;
        card.dataset.price = product.price;
        
        card.innerHTML = `
            <div class="collection-card__media" style="${product.image ? `background-image: url(${product.image}); background-size: cover; background-position: center;` : ''}">
                ${!product.image ? '<span style="color: var(--color-muted);">Image Coming Soon</span>' : ''}
            </div>
            <div class="collection-card__body">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                ${stockWarning}
                <dl>
                    <div>
                        <dt>Metal</dt>
                        <dd>${product.metal}</dd>
                    </div>
                    ${product.gemstone ? `
                    <div>
                        <dt>Gemstone</dt>
                        <dd>${product.gemstone}</dd>
                    </div>
                    ` : ''}
                </dl>
                <div class="collection-card__footer">
                    <span class="price">₹${product.price.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
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
