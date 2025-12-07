// Payment Gateway Service
// Supports Razorpay and Stripe

const PAYMENT_CONFIG = {
  // Razorpay Configuration (Recommended for India)
  RAZORPAY: {
    KEY_ID: 'YOUR_RAZORPAY_KEY_ID', // From Razorpay Dashboard
    KEY_SECRET: 'YOUR_RAZORPAY_KEY_SECRET', // Keep this secret!
    CURRENCY: 'INR',
    COMPANY_NAME: 'Amber Atelier',
    LOGO: 'https://amber-ecru.vercel.app/assets/images/logo.png',
    THEME_COLOR: '#d4af37'
  },
  
  // Stripe Configuration (International payments)
  STRIPE: {
    PUBLISHABLE_KEY: 'YOUR_STRIPE_PUBLISHABLE_KEY',
    SECRET_KEY: 'YOUR_STRIPE_SECRET_KEY',
    CURRENCY: 'inr'
  }
};

class PaymentService {
  constructor() {
    this.razorpayLoaded = false;
    this.stripeLoaded = false;
    this.stripe = null;
  }
  
  // Initialize Razorpay
  async initRazorpay() {
    if (this.razorpayLoaded) return true;
    
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        this.razorpayLoaded = true;
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.head.appendChild(script);
    });
  }
  
  // Initialize Stripe
  async initStripe() {
    if (this.stripeLoaded) return true;
    
    return new Promise((resolve, reject) => {
      if (typeof Stripe !== 'undefined') {
        this.stripe = Stripe(PAYMENT_CONFIG.STRIPE.PUBLISHABLE_KEY);
        this.stripeLoaded = true;
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.stripe = Stripe(PAYMENT_CONFIG.STRIPE.PUBLISHABLE_KEY);
        this.stripeLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(new Error('Failed to load Stripe'));
      document.head.appendChild(script);
    });
  }
  
  // Process Razorpay Payment
  async processRazorpayPayment(orderData) {
    try {
      await this.initRazorpay();
      
      const options = {
        key: PAYMENT_CONFIG.RAZORPAY.KEY_ID,
        amount: orderData.amount * 100, // Convert to paise
        currency: PAYMENT_CONFIG.RAZORPAY.CURRENCY,
        name: PAYMENT_CONFIG.RAZORPAY.COMPANY_NAME,
        description: `Order #${orderData.orderId}`,
        image: PAYMENT_CONFIG.RAZORPAY.LOGO,
        order_id: orderData.razorpayOrderId, // Optional: from backend
        
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone
        },
        
        theme: {
          color: PAYMENT_CONFIG.RAZORPAY.THEME_COLOR
        },
        
        handler: (response) => {
          // Payment successful
          this.handlePaymentSuccess(response, orderData);
        },
        
        modal: {
          ondismiss: () => {
            this.handlePaymentCancelled();
          }
        }
      };
      
      const razorpay = new Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Razorpay payment error:', error);
      this.handlePaymentError(error);
    }
  }
  
  // Process Stripe Payment
  async processStripePayment(orderData) {
    try {
      await this.initStripe();
      
      // Create payment intent on backend first
      const response = await fetch('https://amber-atelier-api.onrender.com/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: 'inr',
          orderId: orderData.orderId
        })
      });
      
      const { clientSecret } = await response.json();
      
      // Confirm payment
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: orderData.customerName,
            email: orderData.customerEmail
          }
        }
      });
      
      if (result.error) {
        this.handlePaymentError(result.error);
      } else {
        this.handlePaymentSuccess(result.paymentIntent, orderData);
      }
      
    } catch (error) {
      console.error('Stripe payment error:', error);
      this.handlePaymentError(error);
    }
  }
  
  // Handle successful payment
  handlePaymentSuccess(paymentResponse, orderData) {
    console.log('Payment successful:', paymentResponse);
    
    // Update order with payment info
    const order = {
      ...orderData,
      paymentId: paymentResponse.razorpay_payment_id || paymentResponse.id,
      paymentStatus: 'completed',
      paymentMethod: paymentResponse.razorpay_payment_id ? 'razorpay' : 'stripe',
      paidAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('amberOrders') || '[]');
    orders.push(order);
    localStorage.setItem('amberOrders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('amberCart');
    
    // Send confirmation email
    if (window.emailService) {
      window.emailService.sendOrderNotification(order);
    }
    
    // Redirect to success page
    window.location.href = `checkout.html?success=true&orderId=${order.orderId}`;
  }
  
  // Handle payment cancellation
  handlePaymentCancelled() {
    console.log('Payment cancelled by user');
    alert('Payment was cancelled. Your order is still in the cart.');
  }
  
  // Handle payment error
  handlePaymentError(error) {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message || 'Unknown error'}. Please try again.`);
  }
  
  // Verify payment on backend (Important for security)
  async verifyPayment(paymentId, orderId, signature) {
    try {
      const response = await fetch('https://amber-atelier-api.onrender.com/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        })
      });
      
      const result = await response.json();
      return result.verified;
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
  
  // Calculate total with tax
  calculateTotal(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const tax = Math.round(subtotal * 0.03); // 3% GST
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }
}

// Create global instance
const paymentService = new PaymentService();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.paymentService = paymentService;
}
