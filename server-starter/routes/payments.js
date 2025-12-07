const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Razorpay Payment Routes

// Create Razorpay Order (Optional - for better security)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    // In production, use Razorpay SDK
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
    
    // const options = {
    //   amount: amount * 100, // amount in paise
    //   currency,
    //   receipt,
    //   payment_capture: 1
    // };
    
    // const order = await razorpay.orders.create(options);
    
    // For now, return mock data
    res.json({
      success: true,
      orderId: 'order_' + Date.now(),
      amount: amount,
      currency: currency
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify Razorpay Payment Signature
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    
    // Generate signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid signature'
      });
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Razorpay Webhook (for payment notifications)
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature === expectedSignature) {
      // Process webhook event
      const event = req.body.event;
      const payload = req.body.payload;
      
      console.log('Webhook event:', event);
      
      switch (event) {
        case 'payment.captured':
          // Payment successful
          console.log('Payment captured:', payload.payment.entity.id);
          break;
          
        case 'payment.failed':
          // Payment failed
          console.log('Payment failed:', payload.payment.entity.id);
          break;
          
        default:
          console.log('Unhandled event:', event);
      }
      
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe Payment Intent (if using Stripe)
router.post('/create-payment-intent', async (req, res) => {
  try {
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const { amount, currency = 'inr' } = req.body;
    
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100,
    //   currency,
    //   automatic_payment_methods: { enabled: true }
    // });
    
    // res.json({ clientSecret: paymentIntent.client_secret });
    
    // Mock response for now
    res.json({
      success: true,
      clientSecret: 'pi_test_' + Date.now()
    });
    
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
