// Collection Page Filtering and Product Display
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initializeFilters();
    initializeSorting();
    initializeFilterToggle();
});

// Mobile filter toggle
function initializeFilterToggle() {
    const toggleBtn = document.getElementById('filter-toggle');
    const sidebar = document.getElementById('filter-sidebar');
    const icon = document.getElementById('filter-icon');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        icon.textContent = isOpen ? '▲' : '▼';
    });
}

function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    // Load products from localStorage
    const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');

    // Filter out-of-stock items and inactive products
    const availableProducts = products.filter(p => {
        const stock = p.inventory?.stock_count ?? p.quantity ?? 0;
        return stock > 0 && (p.active !== false);
    });

    if (availableProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>No products available at the moment. Please check back soon.</p>
            </div>
        `;
        return;
    }

    renderProducts(availableProducts);
}

function renderProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    productsGrid.innerHTML = products.map(product => {
        const category = categorizeProduct(product);
        const metal = product.attributes?.find(a => a.name === "metal")?.value || product.metal || "";
        const metalType = determineMetalType(metal);
        const stock = product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold ?? 5;
        const lowStock = stock <= threshold;
        const primaryImage = product.images?.find(img => img.is_primary)?.url || product.image || "";
        const productName = product.title || product.name || "Untitled";
        const productPrice = product.price ?? 0;

        return `
            <div class="product-card" 
                 data-id="${product.id}" 
                 data-category="${category}" 
                 data-metal="${metalType}" 
                 data-price="${productPrice}">
                <div class="product-image">
                    ${primaryImage ? `<img src="${primaryImage}" alt="${productName}" loading="lazy">` : '<div class="no-image">No Image</div>'}
                    ${lowStock ? `<div class="stock-badge">Only ${stock} left</div>` : ''}
                </div>
                <div class="product-info">
                    <h3>${productName}</h3>
                    <p class="product-metal">${metal}</p>
                    <p class="product-price">₹${productPrice.toLocaleString('en-IN')}</p>
                    <button class="btn-add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');

    attachAddToCartListeners();
    updateResultsCount();
}

function categorizeProduct(product) {
    const name = (product.title || product.name || "").toLowerCase();
    if (name.includes('ring') && !name.includes('earring')) return 'rings';
    if (name.includes('earring')) return 'earrings';
    if (name.includes('necklace') || name.includes('pendant')) return 'necklaces';
    if (name.includes('bracelet') || name.includes('bangle')) return 'bracelets';
    if (name.includes('band')) return 'bands';
    return 'rings';
}

function determineMetalType(metal) {
    const metalLower = (metal || "").toLowerCase();
    if (metalLower.includes('rose')) return 'rose-gold';
    if (metalLower.includes('yellow')) return 'yellow-gold';
    if (metalLower.includes('white')) return 'white-gold';
    if (metalLower.includes('platinum')) return 'platinum';
    return 'yellow-gold';
}

function attachAddToCartListeners() {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');
            const product = products.find(p => p.id === productId);
            
            if (product && window.ShoppingCart) {
                window.ShoppingCart.addItem(product);
            }
        });
    });
}

function initializeFilters() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const metalCheckboxes = document.querySelectorAll('input[name="metal"]');
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    const resetBtn = document.getElementById('reset-filters');

    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            // Handle "All Items" checkbox
            if (cb.value === 'all') {
                categoryCheckboxes.forEach(other => {
                    if (other.value !== 'all') other.checked = false;
                });
            } else {
                const allCheckbox = document.querySelector('input[name="category"][value="all"]');
                if (allCheckbox) allCheckbox.checked = false;
            }
            applyFilters();
        });
    });

    metalCheckboxes.forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            priceValue.textContent = value.toLocaleString('en-IN');
            applyFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

function initializeSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const categoryCheckboxes = Array.from(document.querySelectorAll('input[name="category"]:checked'));
    const metalCheckboxes = Array.from(document.querySelectorAll('input[name="metal"]:checked'));
    const priceSlider = document.getElementById('price-slider');
    const sortSelect = document.getElementById('sort-select');

    const selectedCategories = categoryCheckboxes.map(cb => cb.value);
    const selectedMetals = metalCheckboxes.map(cb => cb.value);
    const maxPrice = priceSlider ? parseInt(priceSlider.value) : Infinity;
    const sortBy = sortSelect ? sortSelect.value : 'featured';

    const allProducts = Array.from(document.querySelectorAll('.product-card'));

    // Filter products
    let visibleProducts = allProducts.filter(card => {
        const category = card.dataset.category;
        const metal = card.dataset.metal;
        const price = parseInt(card.dataset.price);

        const categoryMatch = selectedCategories.length === 0 || 
                             selectedCategories.includes('all') || 
                             selectedCategories.includes(category);
        const metalMatch = selectedMetals.length === 0 || selectedMetals.includes(metal);
        const priceMatch = price <= maxPrice;

        return categoryMatch && metalMatch && priceMatch;
    });

    // Sort products
    visibleProducts.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        const nameA = a.querySelector('h3').textContent;
        const nameB = b.querySelector('h3').textContent;

        switch (sortBy) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name':
                return nameA.localeCompare(nameB);
            case 'newest':
                return parseInt(b.dataset.id) - parseInt(a.dataset.id);
            default:
                return 0;
        }
    });

    // Update display
    allProducts.forEach(card => card.style.display = 'none');
    visibleProducts.forEach(card => card.style.display = 'block');

    updateResultsCount(visibleProducts.length, allProducts.length);
}

function updateResultsCount(visible, total) {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;

    if (visible === undefined) {
        const allCards = document.querySelectorAll('.product-card');
        visible = Array.from(allCards).filter(card => card.style.display !== 'none').length;
        total = allCards.length;
    }

    if (visible === total) {
        resultsCount.textContent = `Showing all ${total} products`;
    } else {
        resultsCount.textContent = `Showing ${visible} of ${total} products`;
    }
}

function resetFilters() {
    // Reset category checkboxes
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });

    // Reset metal checkboxes
    document.querySelectorAll('input[name="metal"]').forEach(cb => {
        cb.checked = false;
    });

    // Reset price slider
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    if (priceSlider && priceValue) {
        priceSlider.value = priceSlider.max;
        priceValue.textContent = parseInt(priceSlider.max).toLocaleString('en-IN');
    }

    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'featured';
    }

    applyFilters();
}
