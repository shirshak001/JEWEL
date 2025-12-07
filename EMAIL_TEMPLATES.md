# EmailJS Template Setup

## Customer Order Confirmation Template

**Template Name:** `customer_order_confirmation`

**Subject:** Order Confirmation #{{order_id}} - Amber Atelier

**HTML Content:**

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 14px 8px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="border-top: 6px solid #d4af37; padding: 16px">
      <a style="text-decoration: none; outline: none; margin-right: 8px; vertical-align: middle" href="https://amber-ecru.vercel.app" target="_blank">
        <span style="font-size: 24px; font-weight: bold; color: #d4af37; vertical-align: middle">Amber</span>
      </a>
      <span style="font-size: 16px; vertical-align: middle; border-left: 1px solid #333; padding-left: 8px;">
        <strong>Thank You for Your Order</strong>
      </span>
    </div>
    
    <div style="padding: 16px">
      <p>Dear {{customer_name}},</p>
      <p>Thank you for your order! We'll send you tracking information when the order ships.</p>
      
      <div style="text-align: left; font-size: 14px; padding-bottom: 4px; border-bottom: 2px solid #333; margin: 16px 0">
        <strong>Order #{{order_id}}</strong>
      </div>
      
      <div style="margin: 16px 0">
        <p><strong>Order Details:</strong></p>
        <div style="background-color: #f9f9f9; padding: 12px; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Date:</strong> {{order_date}}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> {{customer_email}}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> {{customer_phone}}</p>
        </div>
      </div>
      
      <p><strong>Items Ordered:</strong></p>
      <div style="background-color: #f9f9f9; padding: 12px; border-radius: 4px; white-space: pre-line;">
        {{items_list}}
      </div>
      
      <div style="padding: 24px 0">
        <div style="border-top: 2px solid #333"></div>
      </div>
      
      <table style="border-collapse: collapse; width: 100%; text-align: right">
        <tr>
          <td style="width: 60%"></td>
          <td>Shipping</td>
          <td style="padding: 8px; white-space: nowrap">FREE</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td>Taxes</td>
          <td style="padding: 8px; white-space: nowrap">₹{{tax_amount}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td style="border-top: 2px solid #333">
            <strong style="white-space: nowrap">Order Total</strong>
          </td>
          <td style="padding: 16px 8px; border-top: 2px solid #333; white-space: nowrap">
            <strong>₹{{total_amount}}</strong>
          </td>
        </tr>
      </table>
      
      <div style="margin-top: 24px; padding: 16px; background-color: #f0f8ff; border-radius: 4px;">
        <p style="margin: 0;"><strong>What's Next?</strong></p>
        <p style="margin: 8px 0 0 0;">• We'll process your order within 1-2 business days</p>
        <p style="margin: 4px 0 0 0;">• You'll receive a shipping confirmation with tracking</p>
        <p style="margin: 4px 0 0 0;">• Expected delivery: 5-7 business days</p>
      </div>
      
      <p style="margin-top: 24px;">If you have any questions, please contact us at <a href="mailto:shirshakmondaljspbuet@gmail.com">shirshakmondaljspbuet@gmail.com</a></p>
      
      <p>Thank you for choosing Amber Atelier!</p>
    </div>
  </div>
  
  <div style="max-width: 600px; margin: auto; padding-top: 16px;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This email was sent to {{customer_email}}<br />
      You received this email because you placed an order at Amber Atelier
    </p>
  </div>
</div>
```

---

## Admin Order Notification Template

**Template Name:** `admin_order_notification`

**Subject:** 🔔 New Order #{{order_id}} - Amber Atelier

**HTML Content:**

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #333; padding: 14px 8px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="border-top: 6px solid #ff6b6b; padding: 16px; background-color: #fff3cd;">
      <span style="font-size: 20px; font-weight: bold;">
        🎉 New Order Received!
      </span>
    </div>
    
    <div style="padding: 16px">
      <div style="text-align: left; font-size: 16px; padding: 12px; background-color: #e3f2fd; border-left: 4px solid #2196f3; margin: 16px 0">
        <strong>Order #{{order_id}}</strong>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0;">{{customer_name}}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; width: 120px;"><strong>Email:</strong></td>
            <td style="padding: 8px;">{{customer_email}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; width: 120px;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0;">{{customer_phone}}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; width: 120px; vertical-align: top;"><strong>Address:</strong></td>
            <td style="padding: 8px;">{{customer_address}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; width: 120px;"><strong>Order Date:</strong></td>
            <td style="padding: 8px 0;">{{order_date}}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 24px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Order Items</h3>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 4px; font-family: monospace; white-space: pre-line;">{{items_list}}</div>
      </div>
      
      <div style="margin: 24px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; text-align: right; width: 70%;"><strong>Subtotal:</strong></td>
            <td style="padding: 8px 0; text-align: right;">₹{{subtotal}}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; text-align: right; width: 70%;"><strong>Tax (GST 3%):</strong></td>
            <td style="padding: 8px; text-align: right;">₹{{tax_amount}}</td>
          </tr>
          <tr style="border-top: 2px solid #333;">
            <td style="padding: 12px 8px; text-align: right; width: 70%;"><strong style="font-size: 16px;">Total Amount:</strong></td>
            <td style="padding: 12px 8px; text-align: right;"><strong style="font-size: 18px; color: #2e7d32;">₹{{total_amount}}</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 24px; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <p style="margin: 0;"><strong>⚡ Action Required:</strong></p>
        <p style="margin: 8px 0 0 0;">1. Check inventory and prepare items for shipping</p>
        <p style="margin: 4px 0 0 0;">2. Update order status in admin dashboard</p>
        <p style="margin: 4px 0 0 0;">3. Send shipping confirmation to customer</p>
      </div>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://amber-ecru.vercel.app/admin/dashboard.html" style="display: inline-block; padding: 12px 32px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </div>
    </div>
  </div>
  
  <div style="max-width: 600px; margin: auto; padding-top: 16px;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      This is an automated notification from Amber Atelier order system<br />
      Sent to: shirshakmondaljspbuet@gmail.com
    </p>
  </div>
</div>
```

---

## Setup Instructions

### 1. Create Templates in EmailJS:

1. Go to your EmailJS dashboard
2. Click "Email Templates" → "Create New Template"

### 2. For Customer Template:
- **Template Name:** `customer_order_confirmation`
- **Template ID:** Copy this (e.g., `template_abc123`)
- **Subject:** `Order Confirmation #{{order_id}} - Amber Atelier`
- **Content:** Paste the Customer template HTML above

### 3. For Admin Template:
- **Template Name:** `admin_order_notification`  
- **Template ID:** Copy this (e.g., `template_xyz789`)
- **Subject:** `🔔 New Order #{{order_id}} - Amber Atelier`
- **Content:** Paste the Admin template HTML above

### 4. Get Your Public Key:
- Go to "Account" → "General"
- Copy your Public Key

### 5. Update the Config:

Tell me your:
- Template ID for admin notifications
- Template ID for customer confirmations  
- Public Key

And I'll update the code!

---

## Variables Used in Templates:

These are automatically sent from your website:
- `{{order_id}}` - Order number
- `{{customer_name}}` - Customer's name
- `{{customer_email}}` - Customer's email
- `{{customer_phone}}` - Phone number
- `{{customer_address}}` - Full address
- `{{order_date}}` - Order timestamp
- `{{items_list}}` - List of items ordered
- `{{subtotal}}` - Subtotal amount
- `{{tax_amount}}` - Tax amount
- `{{total_amount}}` - Final total

All set up in the code already! ✅
