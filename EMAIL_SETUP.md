# 📧 Email Integration Setup Guide

## Option 1: EmailJS (Recommended - FREE 200 emails/month)

### Step 1: Sign Up for EmailJS

1. Go to: https://www.emailjs.com/
2. Click "Sign Up" (use Google/GitHub)
3. Confirm your email address

### Step 2: Add Email Service

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **Gmail** (or your preferred provider)
4. Connect your Gmail account
5. **Service ID** will be generated (copy this!)

### Step 3: Create Email Templates

#### Admin Order Notification Template:

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. **Template Name**: `admin_order_notification`
4. **Template Content**:

```html
Subject: New Order #{{order_id}} - Amber Atelier

<h2>🎉 New Order Received!</h2>

<div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
  <p><strong>Order ID:</strong> {{order_id}}</p>
  <p><strong>Order Date:</strong> {{order_date}}</p>
</div>

<h3>Customer Information:</h3>
<ul>
  <li><strong>Name:</strong> {{customer_name}}</li>
  <li><strong>Email:</strong> {{customer_email}}</li>
  <li><strong>Phone:</strong> {{customer_phone}}</li>
  <li><strong>Address:</strong> {{customer_address}}</li>
</ul>

<h3>Order Items:</h3>
<pre>{{items_list}}</pre>

<h3>Total Amount: ₹{{total_amount}}</h3>

<p style="color: #666; font-size: 12px;">
  This is an automated notification from Amber Atelier order system.
</p>
```

5. Click **"Save"**
6. **Copy Template ID**

#### Customer Confirmation Template (Optional):

1. Create another template: `customer_confirmation`
2. Content:

```html
Subject: Order Confirmation #{{order_id}} - Amber Atelier

<h2>Thank you for your order, {{to_name}}!</h2>

<p>We've received your order and will process it shortly.</p>

<div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
  <p><strong>Order ID:</strong> {{order_id}}</p>
  <p><strong>Order Date:</strong> {{order_date}}</p>
</div>

<h3>Order Items:</h3>
<pre>{{items_list}}</pre>

<h3>Total Amount: ₹{{total_amount}}</h3>

<p>We'll send you another email when your order ships.</p>

<p>Thank you for choosing Amber Atelier!</p>
```

### Step 4: Get Your API Keys

1. Go to **"Account"** → **"General"**
2. Find **"Public Key"** (copy this!)

### Step 5: Update Your Website

Edit `assets/js/email-service.js`:

```javascript
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_xxxxxxx',      // Your Service ID from Step 2
  TEMPLATE_ID: 'template_xxxxxxx',     // Your Template ID from Step 3
  PUBLIC_KEY: 'xxxxxxxxxxxxx',         // Your Public Key from Step 4
  
  ADMIN_EMAIL: 'shirshakmondaljspbuet@gmail.com',
  // ... rest stays the same
};
```

### Step 6: Test Email System

1. Open browser console on your website
2. Run:
```javascript
window.emailService.sendTestEmail()
```
3. Check your email inbox!

---

## Option 2: Backend Email (Node.js - For Production)

If you want more control, add email to your backend:

### Install Nodemailer:

```powershell
cd server-starter
npm install nodemailer
```

### Create Email Service:

Create `server-starter/services/emailService.js`:

```javascript
const nodemailer = require('nodemailer');

// Configure with Gmail
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD  // Use App Password, not regular password
  }
});

async function sendOrderNotification(orderData) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'shirshakmondaljspbuet@gmail.com',
    subject: `New Order #${orderData.orderNumber}`,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order ID:</strong> ${orderData.orderNumber}</p>
      <p><strong>Customer:</strong> ${orderData.customerInfo.name}</p>
      <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
      <p><strong>Total:</strong> ₹${orderData.total}</p>
      <h3>Items:</h3>
      <ul>
        ${orderData.items.map(item => 
          `<li>${item.name} x${item.quantity} - ₹${item.price}</li>`
        ).join('')}
      </ul>
    `
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendOrderNotification };
```

### Add Email Route:

In `server-starter/routes/orders.js`:

```javascript
const express = require('express');
const router = express.Router();
const { sendOrderNotification } = require('../services/emailService');

router.post('/notify', async (req, res) => {
  try {
    await sendOrderNotification(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Update .env:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
```

### Get Gmail App Password:

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Add to `.env`

---

## 🧪 Testing

### Test EmailJS Integration:

1. Go to your website
2. Add items to cart
3. Go to checkout
4. Fill in form with your email
5. Complete order
6. Check `shirshakmondaljspbuet@gmail.com` inbox

### Expected Emails:

- ✉️ **Admin receives:** Order notification with all details
- ✉️ **Customer receives:** Order confirmation

---

## 🔧 Troubleshooting

### EmailJS Not Working:

- Check Public Key is correct
- Verify Service ID and Template ID
- Check browser console for errors
- Ensure email templates are active
- Check EmailJS monthly quota (200 free emails)

### Gmail App Password Issues:

- Enable 2-Step Verification first
- Generate new app password
- Use 16-character password (no spaces)
- Don't use regular Gmail password

### Emails Going to Spam:

- Add your domain to EmailJS verified senders
- Use proper email templates
- Ask recipients to whitelist your email

---

## 📊 Email Quota

### EmailJS Free Plan:
- ✅ 200 emails/month
- ✅ 2 email services
- ✅ Unlimited templates
- ✅ Email history (30 days)

### Upgrade if needed:
- Personal: $15/month (1,000 emails)
- Team: $70/month (10,000 emails)

---

## 🎯 Quick Start Checklist

For EmailJS (Easiest):
- [ ] Sign up at emailjs.com
- [ ] Connect Gmail service
- [ ] Create admin notification template
- [ ] Copy Service ID, Template ID, Public Key
- [ ] Update `assets/js/email-service.js`
- [ ] Test with `window.emailService.sendTestEmail()`
- [ ] Place a test order
- [ ] Check your email!

**Estimated time: 10 minutes**

---

## 📧 What Happens When Customer Orders:

1. Customer completes checkout
2. Order saved to database
3. **Admin receives email** with:
   - Order ID
   - Customer details
   - Items ordered
   - Total amount
4. Customer receives confirmation email
5. Order appears in admin dashboard

---

## Need Help?

- EmailJS Docs: https://www.emailjs.com/docs/
- Nodemailer Docs: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
