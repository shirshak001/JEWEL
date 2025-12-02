// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartUI();
    }

    loadCart() {
        const saved = localStorage.getItem('soilbuddyCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('soilbuddyCart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                metal: product.metal,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showCartNotification('Item added to cart');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.saveCart();
    }

    updateCartUI() {
        const countElement = document.getElementById('cart-count');
        const itemsContainer = document.getElementById('cart-items');
        const totalElement = document.getElementById('cart-total');
        
        const count = this.getItemCount();
        const total = this.getTotal();

        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }

        if (totalElement) {
            totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
        }

        if (itemsContainer) {
            if (this.items.length === 0) {
                itemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <p>Your cart is empty</p>
                        <a href="collection.html" class="btn-continue">Continue Shopping</a>
                    </div>
                `;
            } else {
                itemsContainer.innerHTML = this.items.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image">No Image</div>'}
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-metal">${item.metal}</p>
                            <p class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="qty-btn" data-action="decrease">−</button>
                                <input type="number" class="qty-input" value="${item.quantity}" min="1" readonly>
                                <button class="qty-btn" data-action="increase">+</button>
                            </div>
                            <button class="btn-remove" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `).join('');

                this.attachCartEventListeners();
            }
        }
    }

    attachCartEventListeners() {
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const productId = parseInt(cartItem.dataset.id);
                const input = cartItem.querySelector('.qty-input');
                const currentQty = parseInt(input.value);
                const action = e.target.dataset.action;

                const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
                if (newQty >= 1) {
                    this.updateQuantity(productId, newQty);
                }
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.removeItem(productId);
            });
        });
    }

    showCartNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Cart drawer functionality
document.addEventListener('DOMContentLoaded', () => {
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const continueShopping = document.getElementById('continue-shopping');

    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', openCart);
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    if (continueShopping) {
        continueShopping.addEventListener('click', closeCart);
    }

    // Update year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Export cart instance for use in other scripts
window.ShoppingCart = cart;
