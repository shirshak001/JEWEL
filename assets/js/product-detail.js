// Product Detail Page Logic
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    initializeGallery();
    attachEventListeners();
});

// Load product from URL parameter
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'collection.html';
        return;
    }

    try {
        // Try to fetch from API first
        const response = await fetch(`${window.API_CONFIG?.baseURL || 'https://jewel-b1ic.onrender.com'}/api/products`);
        if (response.ok) {
            const products = await response.json();
            currentProduct = products.find(p => (p._id && p._id.toString() === productId) || (p.id && p.id.toString() === productId));
        }
    } catch (error) {
        console.error('Failed to fetch from API:', error);
    }

    // Fallback to localStorage
    if (!currentProduct) {
        const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');
        currentProduct = products.find(p => (p._id && p._id.toString() === productId) || (p.id && p.id.toString() === productId));
    }

    if (!currentProduct) {
        alert('Product not found');
        window.location.href = 'collection.html';
        return;
    }

    renderProductDetails();
    loadRecommendations();
}

function renderProductDetails() {
    // Update page title
    document.title = `${currentProduct.title || currentProduct.name} - SoilBuddy Atelier`;
    
    // Breadcrumb
    document.getElementById('breadcrumb-product').textContent = currentProduct.title || currentProduct.name;

    // Product info
    document.getElementById('product-title').textContent = currentProduct.title || currentProduct.name || 'Product';
    
    const metal = currentProduct.attributes?.find(a => a.name === "metal")?.value || currentProduct.metal || "";
    document.getElementById('product-metal').textContent = metal;
    
    const price = currentProduct.price ?? 0;
    document.getElementById('product-price').textContent = `₹${price.toLocaleString('en-IN')}`;
    
    document.getElementById('product-description').textContent = currentProduct.description || 'No description available.';

    // Stock info
    const stock = currentProduct.inventory?.stock ?? currentProduct.inventory?.stock_count ?? currentProduct.quantity ?? 0;
    const threshold = currentProduct.lowStockThreshold ?? 5;
    const stockInfo = document.getElementById('product-stock');
    
    if (stock === 0) {
        stockInfo.innerHTML = '<div class="stock-badge out-of-stock">Out of Stock</div>';
        document.getElementById('add-to-cart-btn').disabled = true;
        document.getElementById('add-to-cart-btn').textContent = 'Out of Stock';
    } else if (stock <= threshold) {
        stockInfo.innerHTML = `<div class="stock-badge low-stock">⚠️ Only ${stock} left in stock</div>`;
    } else {
        stockInfo.innerHTML = `<div class="stock-badge in-stock">✓ In Stock (${stock} available)</div>`;
    }

    // Attributes
    const attributesContainer = document.getElementById('product-attributes');
    if (currentProduct.attributes && currentProduct.attributes.length > 0) {
        attributesContainer.innerHTML = `
            <h3>Specifications</h3>
            <div class="attributes-list">
                ${currentProduct.attributes.map(attr => `
                    <div class="attribute-item">
                        <span class="attribute-label">${attr.name}:</span>
                        <span class="attribute-value">${attr.value}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Images
    const images = Array.isArray(currentProduct.images) && currentProduct.images.length > 0 
        ? currentProduct.images.map(img => img.url) 
        : [currentProduct.image || 'assets/images/placeholder.jpg'];

    renderGallery(images);
}

function renderGallery(images) {
    const mobileGallery = document.getElementById('product-gallery-mobile');
    const desktopGallery = document.getElementById('product-gallery-desktop');
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.getElementById('gallery-thumbnails');

    // Mobile: Swipeable stack
    if (images.length > 1 && window.ImageStack) {
        new ImageStack(mobileGallery, images, {
            mobileOnly: true,
            mobileBreakpoint: 768,
            sensitivity: 150
        });
    } else {
        mobileGallery.innerHTML = `<img src="${images[0]}" alt="Product" style="width: 100%; border-radius: 12px;">`;
    }

    // Desktop: Main image + thumbnails
    mainImage.src = images[0];
    mainImage.alt = currentProduct.title || currentProduct.name;

    if (images.length > 1) {
        thumbnails.innerHTML = images.map((src, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${src}" alt="View ${index + 1}">
            </div>
        `).join('');

        // Thumbnail click handlers
        thumbnails.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                mainImage.src = images[index];
                thumbnails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }
}

function initializeGallery() {
    // Gallery is initialized in renderGallery after product loads
}

function attachEventListeners() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');

    addToCartBtn.addEventListener('click', () => {
        if (currentProduct && window.ShoppingCart) {
            window.ShoppingCart.addItem(currentProduct);
            addToCartBtn.textContent = '✓ Added to Cart';
            setTimeout(() => {
                addToCartBtn.textContent = 'Add to Cart';
            }, 2000);
        }
    });

    viewCartBtn.addEventListener('click', () => {
        if (window.ShoppingCart) {
            window.ShoppingCart.toggleCart();
        }
    });
}

async function loadRecommendations() {
    try {
        let allProducts = [];
        
        // Try API first
        try {
            const response = await fetch(`${window.API_CONFIG?.baseURL || 'https://jewel-b1ic.onrender.com'}/api/products`);
            if (response.ok) {
                allProducts = await response.json();
            }
        } catch (error) {
            console.error('API fetch failed:', error);
        }

        // Fallback to localStorage
        if (allProducts.length === 0) {
            allProducts = JSON.parse(localStorage.getItem('amberProducts') || '[]');
        }

        // Filter out current product and out-of-stock items
        const currentId = currentProduct._id || currentProduct.id;
        const recommendations = allProducts.filter(p => {
            const stock = p.inventory?.stock ?? p.inventory?.stock_count ?? p.quantity ?? 0;
            const pId = p._id || p.id;
            return pId !== currentId && stock > 0 && (p.active !== false);
        });

        // Shuffle and take 4 random products
        const shuffled = recommendations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        renderRecommendations(selected);
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

function renderRecommendations(products) {
    const grid = document.getElementById('recommendations-grid');

    if (products.length === 0) {
        grid.innerHTML = '<p class="no-products">No recommendations available at this time.</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const primaryImage = product.images?.find(img => img.isPrimary || img.is_primary)?.url 
            || product.images?.[0]?.url 
            || product.image 
            || 'assets/images/placeholder.jpg';
        const productName = product.title || product.name || 'Untitled';
        const productPrice = product.price ?? 0;
        const metal = product.attributes?.find(a => a.name === "metal")?.value || product.metal || "";
        const stock = product.inventory?.stock ?? product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold ?? 5;
        const lowStock = stock <= threshold;
        const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
        const productId = product._id || product.id;

        return `
            <div class="product-card ${hasMultipleImages ? 'has-stack' : ''}" onclick="goToProduct('${productId}')">
                <div class="product-image">
                    <img src="${primaryImage}" alt="${productName}" loading="lazy">
                    ${hasMultipleImages ? `<div class="stack-badge">${product.images.length} Photos</div>` : ''}
                    ${lowStock ? `<div class="stock-badge">Only ${stock} left</div>` : ''}
                </div>
                <div class="product-info">
                    <h3>${productName}</h3>
                    <p class="product-metal">${metal}</p>
                    <p class="product-price">₹${productPrice.toLocaleString('en-IN')}</p>
                    <button class="btn-add-to-cart" onclick="event.stopPropagation(); addToCartFromRecommendation('${productId}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function addToCartFromRecommendation(productId) {
    const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');
    const product = products.find(p => (p._id && p._id.toString() === productId) || (p.id && p.id.toString() === productId));
    
    if (product && window.ShoppingCart) {
        window.ShoppingCart.addItem(product);
    }
}
