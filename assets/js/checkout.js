// Checkout Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('amberCart') || '[]');
    
    if (cart.length === 0) {
        window.location.href = 'collection.html';
        return;
    }

    displayOrderSummary(cart);
    setupFormValidation();
    setupProgressFlow();
});

function displayOrderSummary(cart) {
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('summary-subtotal');
    const taxElement = document.getElementById('summary-tax');
    const totalElement = document.getElementById('summary-total');

    if (!summaryItems) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.03); // 3% GST
    const total = subtotal + tax;

    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image">No Image</div>'}
            </div>
            <div class="summary-item-details">
                <h4>${item.name}</h4>
                <p>${item.metal}</p>
                <p>Qty: ${item.quantity}</p>
            </div>
            <div class="summary-item-price">
                ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
        </div>
    `).join('');

    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (taxElement) taxElement.textContent = `₹${tax.toLocaleString('en-IN')}`;
    if (totalElement) totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
}

function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        // Save customer info
        const formData = new FormData(form);
        const customerInfo = Object.fromEntries(formData);
        localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

        // Move to payment section
        showSection('payment-section');
        updateProgress(2);
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }

        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[+]?[0-9]{10,15}$/;
            if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                input.classList.add('error');
                isValid = false;
            }
        }

        // PIN code validation
        if (input.name === 'pincode' && input.value) {
            const pincodeRegex = /^[0-9]{6}$/;
            if (!pincodeRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });

    return isValid;
}

function setupProgressFlow() {
    const backToInfoBtn = document.getElementById('back-to-info');
    const placeOrderBtn = document.getElementById('place-order');

    if (backToInfoBtn) {
        backToInfoBtn.addEventListener('click', () => {
            showSection('customer-info-section');
            updateProgress(1);
        });
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method');
                return;
            }

            processOrder(selectedPayment.value);
        });
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.checkout-section').forEach(section => {
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        if (index < step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

function processOrder(paymentMethod) {
    // Generate order number
    const orderNumber = 'AMB' + Date.now().toString().slice(-8);
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');

    // Save order details
    const order = {
        orderNumber,
        date: new Date().toISOString(),
        customerInfo,
        items: JSON.parse(localStorage.getItem('amberCart') || '[]'),
        paymentMethod,
        status: 'confirmed'
    };

    const orders = JSON.parse(localStorage.getItem('amberOrders') || '[]');
    orders.push(order);
    localStorage.setItem('amberOrders', JSON.stringify(orders));

    // Update product quantities
    updateInventory(order.items);

    // Clear cart
    localStorage.removeItem('amberCart');

    // Show confirmation
    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('confirmation-email').textContent = customerInfo.email;
    showSection('confirmation-section');
    updateProgress(3);

    // Update cart UI
    if (window.ShoppingCart) {
        window.ShoppingCart.items = [];
        window.ShoppingCart.updateCartUI();
    }
}

function updateInventory(orderItems) {
    const products = JSON.parse(localStorage.getItem('amberProducts') || '[]');

    orderItems.forEach(orderItem => {
        const product = products.find(p => p.id === orderItem.id);
        if (product) {
            product.quantity = Math.max(0, product.quantity - orderItem.quantity);
        }
    });

    localStorage.setItem('amberProducts', JSON.stringify(products));
}
