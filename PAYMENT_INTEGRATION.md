# 💳 Payment Gateway Integration Guide

## Option 1: Razorpay (Recommended for India)

### Why Razorpay?
- ✅ No setup fee
- ✅ Lowest transaction fees (2% + GST)
- ✅ Instant activation
- ✅ UPI, Cards, Netbanking, Wallets
- ✅ Automatic settlement
- ✅ Best for Indian customers

---

## 🚀 Razorpay Setup (10 minutes)

### Step 1: Create Razorpay Account

1. Go to: https://dashboard.razorpay.com/signup
2. Sign up with business email
3. Complete KYC (instant for test mode)

### Step 2: Get API Keys

1. Go to **Settings** → **API Keys**
2. Click **Generate Test Keys** (or Live Keys for production)
3. Copy:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Update Frontend Config

Edit `assets/js/payment-service.js`:

```javascript
const PAYMENT_CONFIG = {
  RAZORPAY: {
    KEY_ID: 'rzp_test_xxxxxxxxxxxxx',  // Your Key ID
    KEY_SECRET: 'DO_NOT_EXPOSE_THIS',  // Keep secret! Only use on backend
    CURRENCY: 'INR',
    COMPANY_NAME: 'Amber Atelier',
    LOGO: 'https://amber-ecru.vercel.app/assets/images/logo.png',
    THEME_COLOR: '#d4af37'
  }
};
```

### Step 4: Update Backend .env

Add to `server-starter/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 5: Install Razorpay SDK (Backend)

```powershell
cd server-starter
npm install razorpay
```

### Step 6: Update Payment Routes

Uncomment the Razorpay code in `server-starter/routes/payments.js`:

```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create-order', async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // paise
    currency: 'INR',
    receipt: req.body.receipt
  };
  
  const order = await razorpay.orders.create(options);
  res.json(order);
});
```

### Step 7: Test Payment

1. Use test card: **4111 1111 1111 1111**
2. CVV: Any 3 digits
3. Expiry: Any future date
4. OTP: **1234**

---

## 💰 Transaction Fees

### Razorpay:
- **Domestic Cards**: 2% + GST
- **UPI**: 2% + GST  
- **Netbanking**: 2% + GST
- **Wallets**: 2% + GST
- **International**: 3% + GST

### Settlement:
- T+2 days (2 business days)
- Or instant settlement (extra 0.5%)

---

## 🔄 Payment Flow

### Customer Side:
1. Customer adds items to cart
2. Goes to checkout
3. Fills shipping info
4. Selects "Pay Online"
5. Razorpay popup opens
6. Chooses payment method (UPI/Card/Netbanking)
7. Completes payment
8. Gets order confirmation

### Your Side:
1. Payment notification arrives instantly
2. Email sent to you automatically
3. Money appears in Razorpay dashboard
4. Auto-settles to your bank in 2 days

---

## 🧪 Testing

### Test Mode:
- No real money charged
- Use test cards
- Test all payment methods
- Test failure scenarios

### Test Cards:

**Success:**
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)

**Failed:**
- 4000 0000 0000 0002

**UPI Test:**
- success@razorpay
- failure@razorpay

---

## 🔐 Security Checklist

- [ ] Never expose Key Secret on frontend
- [ ] Always verify payment signature on backend
- [ ] Use HTTPS in production
- [ ] Enable webhook secret verification
- [ ] Store payment IDs securely
- [ ] Log all transactions
- [ ] Handle payment failures gracefully

---

## Option 2: Stripe (International Payments)

### When to use Stripe:
- Accepting international cards
- Multi-currency support
- Subscription billing

### Quick Setup:

1. Sign up: https://dashboard.stripe.com/register
2. Get **Publishable Key** and **Secret Key**
3. Install: `npm install stripe`
4. Update `payment-service.js` with Stripe keys

---

## 📊 Razorpay Dashboard Features

### View Payments:
- Dashboard → Transactions → Payments
- See all successful/failed payments
- Download reports
- Refund payments

### Webhooks:
- Settings → Webhooks
- Add endpoint: `https://amber-atelier-api.onrender.com/api/payments/webhook`
- Select events: `payment.captured`, `payment.failed`
- Copy webhook secret

### Settlements:
- Dashboard → Settlements
- See pending/settled amounts
- Bank account details
- Settlement schedule

---

## 🚨 Go Live Checklist

### Before Activating Live Mode:

1. **Complete KYC:**
   - Business documents
   - Bank account verification
   - GST details (if applicable)

2. **Get Live Keys:**
   - Settings → API Keys → Generate Live Keys
   - Replace test keys in code

3. **Update .env:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=live_secret_key
   ```

4. **Test thoroughly:**
   - Place test order
   - Check email notifications
   - Verify order in admin
   - Check payment in dashboard

5. **Enable Webhook:**
   - Add production webhook URL
   - Verify webhook secret

---

## 💡 Pro Tips

### Increase Conversion:
- Show trust badges
- Display payment options prominently
- Keep checkout simple (3 steps max)
- Offer COD as alternative
- Show security icons

### Reduce Cart Abandonment:
- Save cart on page refresh
- Send cart abandonment emails
- Offer guest checkout
- Show free shipping threshold
- Display total upfront

### Handle Failures:
- Clear error messages
- Retry option
- Alternative payment methods
- Support contact info

---

## 📞 Support

### Razorpay Support:
- Email: support@razorpay.com
- Phone: +91-80-6194-7994
- Docs: https://razorpay.com/docs/

### Test Your Integration:
```javascript
// In browser console on your site:
window.paymentService.processRazorpayPayment({
  orderId: 'TEST-001',
  amount: 100,
  customerName: 'Test User',
  customerEmail: 'test@test.com',
  customerPhone: '9999999999'
});
```

---

## 🎯 Quick Start Commands

```powershell
# Update Razorpay Keys
code assets/js/payment-service.js

# Install backend SDK
cd server-starter
npm install razorpay

# Update .env
echo "RAZORPAY_KEY_ID=rzp_test_xxx" >> .env
echo "RAZORPAY_KEY_SECRET=xxx" >> .env

# Deploy
git add .
git commit -m "Add Razorpay payment gateway"
git push origin main
```

---

**Your payment gateway is ready! Just add your Razorpay keys and start accepting payments! 💰**
