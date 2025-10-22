# Payment System Setup Guide

## Overview

The AgriAI Platform includes a comprehensive payment system with support for multiple payment gateways:
- **Stripe** (Credit/Debit Cards - Visa, Mastercard, Amex)
- **PayPal** (PayPal balance, bank account, cards)
- **M-Pesa** (Mobile money for Kenya and East Africa)
- **Payoneer** (International payments)

### Key Features:
- ✅ **14-day free trial** for all new subscriptions
- ✅ **$9.99/month** subscription fee after trial
- ✅ **3 demo accounts** with full access (no subscription required)
- ✅ **Test mode** for all payment methods
- ✅ **Automatic subscription management**
- ✅ **Webhook integration** for payment status updates

---

## Demo Accounts (Full Access - No Subscription Required)

The following 3 email addresses have full system access without needing a subscription:

1. **demo@agri-ai.com**
2. **showcase@agri-ai.com**
3. **admin@agri-ai.com**

These accounts are configured in:
- `src/server/services/paymentService.js` (DEMO_USERS array)

**Purpose:** These accounts can be used to:
- Demonstrate the full platform to potential users
- Showcase all features without payment barriers
- Internal testing and development
- Sales demonstrations

---

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# Frontend URL
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Stripe Configuration (Credit/Debit Cards)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Use sandbox for testing
PAYPAL_PLAN_ID=P-your_paypal_plan_id  # Create subscription plan in PayPal dashboard

# M-Pesa Configuration (Daraja API)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379  # Your business shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_API_URL=https://sandbox.safaricom.co.ke  # Use sandbox for testing

# Payoneer Configuration
PAYONEER_API_KEY=your_payoneer_api_key
PAYONEER_PROGRAM_ID=your_payoneer_program_id
PAYONEER_API_URL=https://api.payoneer.com  # Production URL
```

---

## Getting API Keys

### 1. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Developers → API Keys**
3. Copy your **Secret Key** (sk_test_...) and **Publishable Key** (pk_test_...)
4. For webhooks:
   - Go to **Developers → Webhooks**
   - Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Webhook Secret** (whsec_...)

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`
- Use any future expiry, any CVC, any ZIP

### 2. PayPal Setup

1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Go to **Dashboard → My Apps & Credentials**
3. Create a **REST API app**
4. Copy **Client ID** and **Secret**
5. Create a subscription plan:
   - Go to **Products & Services → Subscriptions**
   - Create new plan: $9.99/month
   - Copy the **Plan ID**

**Test Account:**
- Use PayPal Sandbox accounts for testing
- Create buyer and seller test accounts in PayPal Developer dashboard

### 3. M-Pesa Setup (Kenya)

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create a **Lipa Na M-Pesa Online** app
3. Get your:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode**
   - **Passkey**
4. Configure callback URL: `https://yourdomain.com/api/payments/mpesa/callback`

**Test Phone Numbers:**
- Sandbox test number: `254708374149`
- Amount: Use any amount for testing in sandbox

### 4. Payoneer Setup

1. Contact Payoneer sales for API access
2. Get your:
   - **API Key**
   - **Program ID**
3. Configure webhook URL: `https://yourdomain.com/api/payments/payoneer/webhook`

---

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend dependencies
npm install stripe @paypal/checkout-server-sdk axios

# Or with yarn
yarn add stripe @paypal/checkout-server-sdk axios
```

### 2. Update Server Index

Add payment routes to `src/server/index.js`:

```javascript
import paymentRoutes from './routes/payments.js';

// Add payment routes
app.use('/api/payments', paymentRoutes);
```

### 3. Apply Subscription Middleware

Protect routes that require subscription:

```javascript
import { requireSubscription } from './middleware/subscription.js';

// Protect specific routes
router.get('/api/crops/recommendations',
  authenticate,
  requireSubscription,  // Add this middleware
  getCropRecommendations
);
```

### 4. Add Payment Route to Frontend

Update `src/App.tsx` to include payment route:

```tsx
import PaymentPage from './components/Payment/PaymentPage';

// Add route
<Route path="/payment" element={
  <ProtectedRoute>
    <PaymentPage />
  </ProtectedRoute>
} />
```

---

## Testing Payments

### Automated Tests

Run the payment service tests:

```bash
# Run all tests
npm test src/server/__tests__/paymentService.test.js

# Or with Jest
jest paymentService.test.js
```

### Manual Testing

#### Test Mode (Recommended for Development)

All payment components have a **Test Mode** toggle:

1. **Stripe Test Mode**:
   - Enable test mode toggle
   - Click "Simulate Payment"
   - No actual Stripe API call is made
   - Subscription is activated immediately

2. **PayPal Test Mode**:
   - Enable test mode toggle
   - Click "Simulate PayPal Payment"
   - No PayPal redirect
   - Instant subscription activation

3. **M-Pesa Test Mode**:
   - Enable test mode toggle
   - Enter any valid phone number format (254XXXXXXXXX)
   - Click "Simulate M-Pesa Payment"
   - Instant confirmation

4. **Payoneer Test Mode**:
   - Enable test mode toggle
   - Click "Simulate Payoneer Payment"
   - Instant subscription activation

#### Live Testing (Sandbox Environments)

1. **Stripe Sandbox**:
   - Disable test mode
   - Use test card numbers
   - Complete real Stripe checkout
   - Verify webhook receives events

2. **PayPal Sandbox**:
   - Disable test mode
   - Use PayPal sandbox credentials
   - Complete PayPal approval flow
   - Check subscription status

3. **M-Pesa Sandbox**:
   - Disable test mode
   - Use Safaricom sandbox credentials
   - Send STK push to test number
   - Verify callback received

---

## API Endpoints

### Get Subscription Plans
```
GET /api/payments/plans
```

### Create Stripe Checkout Session
```
POST /api/payments/stripe/create-checkout-session
Headers: x-api-key: <token>
Body: { planId: "monthly" }
```

### Verify Stripe Payment
```
POST /api/payments/stripe/verify
Headers: x-api-key: <token>
Body: { sessionId: "cs_test_..." }
```

### Create PayPal Subscription
```
POST /api/payments/paypal/create-subscription
Headers: x-api-key: <token>
Body: { planId: "monthly" }
```

### Initiate M-Pesa Payment
```
POST /api/payments/mpesa/initiate
Headers: x-api-key: <token>
Body: { phoneNumber: "254712345678", planId: "monthly" }
```

### Create Payoneer Payment
```
POST /api/payments/payoneer/create-payment
Headers: x-api-key: <token>
Body: { planId: "monthly" }
```

### Get Subscription Status
```
GET /api/payments/subscription/status
Headers: x-api-key: <token>
```

### Check Demo User
```
GET /api/payments/is-demo-user
Headers: x-api-key: <token>
```

### Cancel Subscription
```
POST /api/payments/cancel-subscription
Headers: x-api-key: <token>
Body: { subscriptionId: "sub_...", provider: "stripe" }
```

---

## Webhook Configuration

### Stripe Webhooks

Configure in Stripe Dashboard:
- URL: `https://yourdomain.com/api/payments/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

### PayPal Webhooks

Configure in PayPal Dashboard:
- URL: `https://yourdomain.com/api/payments/paypal/webhook`
- Events:
  - `BILLING.SUBSCRIPTION.ACTIVATED`
  - `BILLING.SUBSCRIPTION.CANCELLED`
  - `BILLING.SUBSCRIPTION.SUSPENDED`
  - `PAYMENT.SALE.COMPLETED`

### M-Pesa Callbacks

Configure in Safaricom Portal:
- URL: `https://yourdomain.com/api/payments/mpesa/callback`
- Method: POST

### Payoneer Webhooks

Configure with Payoneer Support:
- URL: `https://yourdomain.com/api/payments/payoneer/webhook`

---

## Subscription Flow

### New User Flow

1. **Registration** → User creates account
2. **Trial Start** → 14-day free trial begins automatically
3. **Trial Period** → Full access to all features
4. **Trial Ending** → Email reminders at 7, 3, and 1 day before trial ends
5. **Payment Required** → User prompted to add payment method
6. **Payment Success** → Subscription activated, full access continues
7. **Payment Failed** → Access limited to basic features

### Demo User Flow

1. **Registration** → User registers with demo email
2. **Instant Access** → Full access granted immediately
3. **No Payment** → Never prompted for payment
4. **No Expiration** → Access never expires

---

## Security Considerations

1. **API Keys Protection**:
   - Never commit `.env` files to git
   - Use environment variables in production
   - Rotate keys regularly

2. **Webhook Verification**:
   - Always verify webhook signatures
   - Stripe: Use `stripe.webhooks.constructEvent()`
   - PayPal: Verify using SDK
   - M-Pesa: Verify callback authenticity

3. **User Data**:
   - Store minimal payment information
   - Use payment gateway's customer IDs
   - Never store full card numbers

4. **HTTPS Required**:
   - All payment endpoints must use HTTPS
   - Webhook URLs must be HTTPS
   - Frontend must be served over HTTPS

---

## Troubleshooting

### Stripe Issues

**Problem**: "Invalid API key provided"
- **Solution**: Check `STRIPE_SECRET_KEY` in `.env`
- Ensure you're using the correct key (test vs live)

**Problem**: Webhook signature verification fails
- **Solution**: Check `STRIPE_WEBHOOK_SECRET`
- Ensure raw body is passed to webhook endpoint

### PayPal Issues

**Problem**: "Authentication failed"
- **Solution**: Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Check you're using sandbox credentials for testing

**Problem**: Plan ID not found
- **Solution**: Create subscription plan in PayPal dashboard
- Use correct Plan ID in environment variables

### M-Pesa Issues

**Problem**: "Invalid phone number"
- **Solution**: Use format `254XXXXXXXXX` (Kenya)
- Remove spaces and special characters

**Problem**: STK push not received
- **Solution**: Check business shortcode and passkey
- Verify phone number is M-Pesa registered
- Check sandbox vs production environment

### Payoneer Issues

**Problem**: API connection failed
- **Solution**: Verify API key and program ID
- Contact Payoneer support for API access

---

## Production Deployment Checklist

- [ ] Switch all payment gateways to production mode
- [ ] Update environment variables with production keys
- [ ] Configure production webhook URLs
- [ ] Enable HTTPS for all endpoints
- [ ] Set up webhook monitoring and logging
- [ ] Configure email notifications for failed payments
- [ ] Set up automated backup of subscription data
- [ ] Test production payment flow end-to-end
- [ ] Configure subscription renewal reminders
- [ ] Set up analytics for payment conversion tracking

---

## Support & Resources

### Documentation Links:
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **PayPal**: [developer.paypal.com/docs](https://developer.paypal.com/docs)
- **M-Pesa**: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
- **Payoneer**: Contact Payoneer support for API docs

### Test Mode Benefits:
- ✅ No actual charges
- ✅ Instant confirmation
- ✅ No API limits
- ✅ Perfect for development
- ✅ Frontend testing without backend setup

---

**Last Updated**: 2025-10-22
**Version**: 1.0
