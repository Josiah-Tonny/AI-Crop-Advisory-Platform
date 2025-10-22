/**
 * Payment Service
 * Handles subscription payments via multiple gateways:
 * - Stripe (for Visa/Mastercard)
 * - PayPal
 * - M-Pesa (via Daraja API)
 * - Payoneer (via their API)
 */

import Stripe from 'stripe';
import axios from 'axios';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Special users with full access (no subscription required)
const DEMO_USERS = [
  'demo@agri-ai.com',
  'showcase@agri-ai.com',
  'admin@agri-ai.com'
];

// Subscription plans
const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Subscription',
    price: 999, // $9.99 in cents
    currency: 'USD',
    interval: 'month',
    trialDays: 14,
    features: [
      'Unlimited AI Advisory',
      'Real-time Weather Data',
      'Crop Recommendations',
      'Soil Analysis',
      'Pest Control Insights',
      'Irrigation Scheduling',
      'Community Access',
      'Priority Support'
    ]
  }
};

/**
 * Check if user is a demo/showcase account
 */
export const isDemoUser = (email) => {
  return DEMO_USERS.includes(email.toLowerCase());
};

/**
 * Check if user has active subscription or is in trial
 */
export const hasActiveSubscription = (user) => {
  // Demo users always have access
  if (isDemoUser(user.email)) {
    return true;
  }

  // Check if subscription is active
  if (user.subscriptionStatus === 'active') {
    return true;
  }

  // Check if still in trial period
  if (user.subscriptionStatus === 'trialing') {
    const trialEnd = new Date(user.trialEndDate);
    return trialEnd > new Date();
  }

  return false;
};

/**
 * Create Stripe Checkout Session
 */
export const createStripeCheckoutSession = async (userId, userEmail, planId = 'monthly') => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
            },
            recurring: {
              interval: plan.interval,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: plan.trialDays,
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: planId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    throw new Error('Failed to create payment session');
  }
};

/**
 * Create PayPal Order
 */
export const createPayPalOrder = async (userId, userEmail, planId = 'monthly') => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  try {
    const response = await axios.post(
      `${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v1/billing/subscriptions`,
      {
        plan_id: process.env.PAYPAL_PLAN_ID,
        subscriber: {
          email_address: userEmail,
        },
        application_context: {
          brand_name: 'AgriAI Platform',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment/paypal/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        },
        custom_id: userId.toString(),
      },
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      subscriptionId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error.response?.data || error);
    throw new Error('Failed to create PayPal subscription');
  }
};

/**
 * Initiate M-Pesa STK Push
 * M-Pesa is a mobile payment service popular in Kenya and other African countries
 */
export const initiateMpesaPayment = async (userId, phoneNumber, planId = 'monthly') => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  // Convert USD to KES (approximate rate: 1 USD = 130 KES)
  const amountKES = Math.ceil((plan.price / 100) * 130);

  try {
    // Get M-Pesa access token
    const authString = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.get(
      `${process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke'}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

    // Generate password
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Initiate STK push
    const stkResponse = await axios.post(
      `${process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke'}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amountKES,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`,
        AccountReference: `SUB-${userId}`,
        TransactionDesc: `${plan.name} - AgriAI Platform`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
      merchantRequestId: stkResponse.data.MerchantRequestID,
      responseCode: stkResponse.data.ResponseCode,
      responseDescription: stkResponse.data.ResponseDescription,
      customerMessage: stkResponse.data.CustomerMessage,
    };
  } catch (error) {
    console.error('M-Pesa payment error:', error.response?.data || error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

/**
 * Create Payoneer Payment
 * Note: Payoneer doesn't have a direct subscription API, so this creates a one-time charge
 */
export const createPayoneerPayment = async (userId, userEmail, planId = 'monthly') => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  try {
    // Payoneer API integration
    // This is a simplified version - actual implementation depends on Payoneer's requirements
    const response = await axios.post(
      `${process.env.PAYONEER_API_URL || 'https://api.payoneer.com'}/v4/charges`,
      {
        program_id: process.env.PAYONEER_PROGRAM_ID,
        amount: (plan.price / 100).toFixed(2),
        currency: plan.currency,
        description: plan.name,
        customer_id: userId.toString(),
        notification_url: `${process.env.BACKEND_URL}/api/payments/payoneer/webhook`,
        success_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYONEER_API_KEY}`,
        },
      }
    );

    return {
      paymentId: response.data.payment_id,
      paymentUrl: response.data.payment_url,
    };
  } catch (error) {
    console.error('Payoneer payment error:', error.response?.data || error);
    throw new Error('Failed to create Payoneer payment');
  }
};

/**
 * Verify Stripe Payment
 */
export const verifyStripePayment = async (sessionId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      return {
        success: true,
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        userId: session.metadata.userId,
      };
    }

    return {
      success: false,
      message: 'Payment not completed',
    };
  } catch (error) {
    console.error('Stripe verification error:', error);
    throw new Error('Failed to verify payment');
  }
};

/**
 * Cancel Subscription
 */
export const cancelSubscription = async (subscriptionId, provider = 'stripe') => {
  try {
    if (provider === 'stripe' && stripe) {
      await stripe.subscriptions.cancel(subscriptionId);
      return { success: true };
    }

    if (provider === 'paypal') {
      await axios.post(
        `${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason: 'Customer requested cancellation' },
        {
          auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECRET,
          },
        }
      );
      return { success: true };
    }

    throw new Error('Unsupported payment provider');
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Get subscription details
 */
export const getSubscriptionDetails = async (subscriptionId, provider = 'stripe') => {
  try {
    if (provider === 'stripe' && stripe) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    if (provider === 'paypal') {
      const response = await axios.get(
        `${process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'}/v1/billing/subscriptions/${subscriptionId}`,
        {
          auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_CLIENT_SECRET,
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status.toLowerCase(),
        currentPeriodEnd: new Date(response.data.billing_info.next_billing_time),
        cancelAtPeriodEnd: response.data.status === 'CANCELLED',
      };
    }

    throw new Error('Unsupported payment provider');
  } catch (error) {
    console.error('Get subscription details error:', error);
    throw new Error('Failed to get subscription details');
  }
};

export default {
  isDemoUser,
  hasActiveSubscription,
  createStripeCheckoutSession,
  createPayPalOrder,
  initiateMpesaPayment,
  createPayoneerPayment,
  verifyStripePayment,
  cancelSubscription,
  getSubscriptionDetails,
  SUBSCRIPTION_PLANS,
  DEMO_USERS,
};
