// Collection Page Filtering and Product Display
document.addEventListener('DOMContentLoaded', () => {
    fetchAndLoadCollectionProducts();
    initializeFilters();
    initializeSorting();
    initializeFilterToggle();
});

// Fetch products from API
async function fetchAndLoadCollectionProducts() {
    try {
        // Get API URL from config
        const API_URL = window.APP_CONFIG?.API_URL || 'https://jewel-b1ic.onrender.com';
        
        console.log('Fetching products from:', API_URL);
        
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
        
        console.log('Products loaded:', products.length);
        
        // Store in localStorage for offline access
        if (products.length > 0) {
            localStorage.setItem("amberProducts", JSON.stringify(products));
        }
        
        // Load products on page
        loadProducts(products);
        
    } catch (error) {
        console.error('Error fetching products from API:', error);
        // Fallback to localStorage if fetch fails
        const stored = localStorage.getItem("amberProducts");
        if (stored) {
            console.log('Using cached products from localStorage');
            const products = JSON.parse(stored);
            loadProducts(products);
        } else {
            showNoProductsMessage();
        }
    }
}

function showNoProductsMessage() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>Unable to load products. Please check your connection and try refreshing the page.</p>
            </div>
        `;
    }
}

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

function loadProducts(products = null) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    // If no products passed, try to get from localStorage
    if (!products) {
        const stored = localStorage.getItem('amberProducts');
        if (!stored) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <p>No products available at the moment. Please check back soon.</p>
                </div>
            `;
            return;
        }
        products = JSON.parse(stored);
    }

    // Filter out-of-stock items and inactive products
    const availableProducts = products.filter(p => {
        const stock = p.inventory?.stock ?? p.inventory?.stock_count ?? p.quantity ?? 0;
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
        const stock = product.inventory?.stock ?? product.inventory?.stock_count ?? product.quantity ?? 0;
        const threshold = product.lowStockThreshold ?? 5;
        const lowStock = stock <= threshold;
        const primaryImage = product.images?.find(img => img.isPrimary || img.is_primary)?.url || product.images?.[0]?.url || product.image || "";
        const productName = product.title || product.name || "Untitled";
        const productPrice = product.price ?? 0;
        const hasMultipleImages = Array.isArray(product.images) && product.images.length > 1;
        const productId = product._id || product.id;

        return `
            <div class="product-card ${hasMultipleImages ? 'has-stack' : ''}" 
                 data-id="${productId}" 
                 data-category="${category}" 
                 data-metal="${metalType}" 
                 data-price="${productPrice}">
                <div class="product-image">
                    ${primaryImage ? `<img src="${primaryImage}" alt="${productName}" loading="lazy">` : '<div class="no-image">No Image</div>'}
                    ${hasMultipleImages ? `<div class="stack-badge">${product.images.length} Photos</div>` : ''}
                    ${lowStock ? `<div class="stock-badge">Only ${stock} left</div>` : ''}
                </div>
                <div class="product-info">
                    <h3>${productName}</h3>
                    <p class="product-metal">${metal}</p>
                    <p class="product-price">₹${productPrice.toLocaleString('en-IN')}</p>
                    <button class="btn-add-to-cart" data-id="${productId}">Add to Cart</button>
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
            const productId = e.target.dataset.id;
            const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');
            const product = products.find(p => (p._id && p._id.toString() === productId) || (p.id && p.id.toString() === productId));
            
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

// ==================== Product Detail Modal ====================
function openProductModal(productId) {
    const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalName = document.getElementById('modal-product-name');
    const modalMetal = document.getElementById('modal-product-metal');
    const modalPrice = document.getElementById('modal-product-price');
    const modalDescription = document.getElementById('modal-product-description');
    const modalStock = document.getElementById('modal-product-stock');
    const modalAddCart = document.getElementById('modal-add-cart');
    const modalGalleryMobile = document.getElementById('modal-gallery-mobile');
    const modalGalleryDesktop = document.getElementById('modal-gallery-desktop');
    
    // Set product details
    modalName.textContent = product.title || product.name || 'Product';
    const metal = product.attributes?.find(a => a.name === "metal")?.value || product.metal || "";
    modalMetal.textContent = metal;
    modalPrice.textContent = `₹${(product.price ?? 0).toLocaleString('en-IN')}`;
    modalDescription.textContent = product.description || 'No description available.';
    
    const stock = product.inventory?.stock ?? product.inventory?.stock_count ?? product.quantity ?? 0;
    const threshold = product.lowStockThreshold ?? 5;
    if (stock <= threshold) {
        modalStock.innerHTML = `<strong>⚠️ Only ${stock} left in stock</strong>`;
        modalStock.style.display = 'block';
    } else {
        modalStock.style.display = 'none';
    }
    
    // Handle images
    const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images.map(img => img.url) 
        : [product.image || ''];
    
    // Clear previous galleries
    modalGalleryMobile.innerHTML = '';
    modalGalleryDesktop.innerHTML = '';
    
    if (images.length > 1 && window.ImageStack) {
        // Initialize mobile swipeable gallery
        new ImageStack(modalGalleryMobile, images, {
            mobileOnly: true,
            mobileBreakpoint: 768,
            sensitivity: 150
        });
    } else {
        // Single image - show in both views
        modalGalleryMobile.innerHTML = `<img src="${images[0]}" alt="${product.name}" style="width: 100%; border-radius: 12px;">`;
    }
    
    // Desktop gallery (simple grid)
    modalGalleryDesktop.innerHTML = images.map((src, i) => `
        <div class="grid-image-item">
            <img src="${src}" alt="${product.name} - Image ${i + 1}">
        </div>
    `).join('');
    
    // Add to cart handler
    modalAddCart.onclick = () => {
        if (window.ShoppingCart) {
            window.ShoppingCart.addItem(product);
            modal.classList.remove('active');
        }
    };
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function initializeModal() {
    const modal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeProductModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProductModal);
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
    
    // Add click handlers to product cards
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.btn-add-to-cart')) {
            const productId = productCard.dataset.id;
            window.location.href = `product.html?id=${productId}`;
        }
    });
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initializeFilters();
    initializeModal();
});
