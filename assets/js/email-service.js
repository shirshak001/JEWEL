// Email Service Configuration
const EMAIL_CONFIG = {
  // EmailJS Configuration (Free - 200 emails/month)
  // Sign up at https://www.emailjs.com/
  SERVICE_ID: 'service_79zno9n',
  TEMPLATE_ID: 'template_wyxmw4p', // Admin order notification template
  PUBLIC_KEY: '5OdOzrzDFhIbtdccq', // EmailJS Public Key
  
  // Admin email to receive order notifications
  ADMIN_EMAIL: 'shirshakmondaljspbuet@gmail.com',
  
  // Email templates
  ORDER_SUBJECT: 'New Order Received - Amber Atelier',
  ORDER_TEMPLATE: (order) => `
    <h2>New Order Received!</h2>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Customer Name:</strong> ${order.customerName}</p>
    <p><strong>Customer Email:</strong> ${order.customerEmail}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    
    <h3>Order Items:</h3>
    <ul>
      ${order.items.map(item => `
        <li>${item.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>
      `).join('')}
    </ul>
    
    <p><strong>Total Amount:</strong> $${order.total}</p>
    <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</p>
  `
};

// Email Service Class
class EmailService {
  constructor() {
    this.initialized = false;
  }
  
  // Initialize EmailJS
  async init() {
    if (this.initialized) return;
    
    // Check if EmailJS is configured
    if (EMAIL_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      console.warn('EmailJS not configured. Email notifications disabled.');
      return;
    }
    
    try {
      // Load EmailJS script dynamically
      await this.loadEmailJS();
      emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
      this.initialized = true;
      console.log('Email service initialized');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }
  
  // Load EmailJS library
  loadEmailJS() {
    return new Promise((resolve, reject) => {
      if (typeof emailjs !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Send order notification to admin
  async sendOrderNotification(orderData) {
    try {
      await this.init();
      
      // Skip if not configured
      if (!this.initialized) {
        console.warn('Email service not configured, skipping admin notification');
        return { success: false, error: 'Email service not configured' };
      }
      
      // Prepare email parameters
      const emailParams = {
        to_email: EMAIL_CONFIG.ADMIN_EMAIL,
        subject: EMAIL_CONFIG.ORDER_SUBJECT,
        order_id: orderData.id || Date.now(),
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.phone || 'N/A',
        customer_address: orderData.address,
        items_list: this.formatOrderItems(orderData.items),
        total_amount: orderData.total,
        order_date: new Date().toLocaleString()
      };
      
      // Send via EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        emailParams
      );
      
      console.log('Order notification sent successfully:', response);
      return { success: true, messageId: response.text };
      
    } catch (error) {
      console.error('Failed to send order notification:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send order confirmation to customer
  async sendCustomerConfirmation(orderData) {
    try {
      await this.init();
      
      // Skip if not configured
      if (!this.initialized) {
        console.warn('Email service not configured, skipping customer confirmation');
        return { success: false, error: 'Email service not configured' };
      }
      
      const emailParams = {
        to_email: orderData.customerEmail,
        to_name: orderData.customerName,
        subject: 'Order Confirmation - Amber Atelier',
        order_id: orderData.id || Date.now(),
        items_list: this.formatOrderItems(orderData.items),
        total_amount: orderData.total,
        order_date: new Date().toLocaleString()
      };
      
      // Send via EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        'template_0edks8j', // Customer confirmation template
        emailParams
      );
      
      console.log('Customer confirmation sent:', response);
      return { success: true };
      
    } catch (error) {
      console.error('Failed to send customer confirmation:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Format order items for email
  formatOrderItems(items) {
    return items.map(item => 
      `${item.name} x${item.quantity} - $${item.price}`
    ).join('\n');
  }
  
  // Test email sending
  async sendTestEmail() {
    const testOrder = {
      id: 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      phone: '123-456-7890',
      address: '123 Test Street, Test City',
      items: [
        { name: 'Gold Necklace', quantity: 1, price: 500 },
        { name: 'Diamond Ring', quantity: 2, price: 1200 }
      ],
      total: 2900
    };
    
    return await this.sendOrderNotification(testOrder);
  }
}

// Create global instance
const emailService = new EmailService();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.emailService = emailService;
}
