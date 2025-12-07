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
    if (!form) {
        console.error('Checkout form not found');
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');

        if (!validateForm(form)) {
            console.log('Form validation failed');
            alert('Please fill in all required fields correctly');
            return;
        }

        // Save customer info
        const formData = new FormData(form);
        const customerInfo = Object.fromEntries(formData);
        localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
        console.log('Customer info saved, moving to payment section');

        // Move to payment section
        showSection('payment-section');
        updateProgress(2);
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    const errors = [];

    inputs.forEach(input => {
        const fieldName = input.name || input.id;
        
        if (!input.value.trim()) {
            input.classList.add('error');
            input.style.borderColor = '#ef4444';
            errors.push(`${fieldName} is required`);
            isValid = false;
        } else {
            input.classList.remove('error');
            input.style.borderColor = '';
        }

        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                input.style.borderColor = '#ef4444';
                errors.push('Invalid email format');
                isValid = false;
            }
        }

        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[+]?[0-9]{10,15}$/;
            if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                input.classList.add('error');
                input.style.borderColor = '#ef4444';
                errors.push('Invalid phone number');
                isValid = false;
            }
        }

        // PIN code validation
        if (input.name === 'pincode' && input.value) {
            const pincodeRegex = /^[0-9]{6}$/;
            if (!pincodeRegex.test(input.value)) {
                input.classList.add('error');
                input.style.borderColor = '#ef4444';
                errors.push('PIN code must be 6 digits');
                isValid = false;
            }
        }
    });

    if (!isValid) {
        console.log('Validation errors:', errors);
    }

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
        placeOrderBtn.addEventListener('click', async () => {
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method');
                return;
            }

            const paymentMethod = selectedPayment.value;
            
            // If Cash on Delivery, process directly
            if (paymentMethod === 'cod') {
                processOrder(paymentMethod);
                return;
            }
            
            // For online payments (Razorpay/Stripe)
            if (paymentMethod === 'razorpay' || paymentMethod === 'online') {
                await processOnlinePayment();
            } else {
                processOrder(paymentMethod);
            }
        });
    }
}

function showSection(sectionId) {
    console.log('Switching to section:', sectionId);
    
    document.querySelectorAll('.checkout-section').forEach(section => {
        section.classList.add('hidden');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log('Section switched successfully');
        
        // Scroll to top of section
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.error('Section not found:', sectionId);
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

// Process online payment via Razorpay
async function processOnlinePayment() {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    const cart = JSON.parse(localStorage.getItem('amberCart') || '[]');
    const orderNumber = 'AMB' + Date.now().toString().slice(-8);
    
    if (!window.paymentService) {
        alert('Payment service not loaded. Please refresh the page.');
        return;
    }
    
    const { subtotal, tax, total } = window.paymentService.calculateTotal(cart);
    
    const orderData = {
        orderId: orderNumber,
        amount: total,
        customerName: customerInfo.name || 'Customer',
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone || '',
        items: cart
    };
    
    // Process payment
    try {
        await window.paymentService.processRazorpayPayment(orderData);
    } catch (error) {
        console.error('Payment processing error:', error);
        alert('Payment failed. Please try again or choose Cash on Delivery.');
    }
}

async function processOrder(paymentMethod) {
    // Generate order number
    const orderNumber = 'AMB' + Date.now().toString().slice(-8);
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    const cart = JSON.parse(localStorage.getItem('amberCart') || '[]');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.03);
    const total = subtotal + tax;

    // Save order details
    const order = {
        orderNumber,
        date: new Date().toISOString(),
        customerInfo,
        items: cart,
        paymentMethod,
        status: 'confirmed',
        subtotal,
        tax,
        total
    };

    const orders = JSON.parse(localStorage.getItem('amberOrders') || '[]');
    orders.push(order);
    localStorage.setItem('amberOrders', JSON.stringify(orders));

    // Update product quantities
    updateInventory(order.items);

    // Send email notification to admin
    try {
        if (window.emailService) {
            const emailData = {
                id: orderNumber,
                customerName: customerInfo.name || 'N/A',
                customerEmail: customerInfo.email || 'N/A',
                phone: customerInfo.phone || 'N/A',
                address: `${customerInfo.address || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} - ${customerInfo.zipCode || ''}`.trim(),
                items: cart.map(item => ({
                    name: item.name || item.title,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total
            };
            
            // Send admin notification
            const adminResult = await window.emailService.sendOrderNotification(emailData);
            console.log('Admin email result:', adminResult);
            
            // Send customer confirmation
            const customerResult = await window.emailService.sendCustomerConfirmation(emailData);
            console.log('Customer email result:', customerResult);
        }
    } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't stop order processing if email fails
    }

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
