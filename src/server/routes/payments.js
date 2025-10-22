/**
 * Payment Routes
 * Handles all payment-related API endpoints
 */

import express from 'express';
import paymentService from '../services/paymentService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get subscription plans
 */
router.get('/plans', (req, res) => {
  try {
    res.json({
      success: true,
      plans: paymentService.SUBSCRIPTION_PLANS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Create Stripe checkout session
 */
router.post('/stripe/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const session = await paymentService.createStripeCheckoutSession(
      userId,
      userEmail,
      planId
    );

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Verify Stripe payment
 */
router.post('/stripe/verify', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;

    const verification = await paymentService.verifyStripePayment(sessionId);

    if (verification.success) {
      // Update user subscription in database
      // This should update the user record with subscription details
      // For now, we'll return the verification data
      res.json({
        success: true,
        subscription: verification,
      });
    } else {
      res.status(400).json({
        success: false,
        message: verification.message,
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Stripe webhook endpoint
 */
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify webhook signature and process event
    // This is where you'd update subscription status in your database
    // based on Stripe events like invoice.paid, customer.subscription.deleted, etc.

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * Create PayPal subscription
 */
router.post('/paypal/create-subscription', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const order = await paymentService.createPayPalOrder(userId, userEmail, planId);

    res.json({
      success: true,
      subscriptionId: order.subscriptionId,
      approvalUrl: order.approvalUrl,
    });
  } catch (error) {
    console.error('Create PayPal subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PayPal webhook endpoint
 */
router.post('/paypal/webhook', express.json(), async (req, res) => {
  try {
    // Verify PayPal webhook and process event
    // Handle events like BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.CANCELLED, etc.

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Initiate M-Pesa payment
 */
router.post('/mpesa/initiate', authenticate, async (req, res) => {
  try {
    const { phoneNumber, planId } = req.body;
    const userId = req.user.id;

    // Validate phone number format (Kenyan format: 254XXXXXXXXX)
    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use format: 254XXXXXXXXX',
      });
    }

    const payment = await paymentService.initiateMpesaPayment(
      userId,
      phoneNumber,
      planId
    );

    res.json({
      success: true,
      checkoutRequestId: payment.checkoutRequestId,
      message: payment.customerMessage,
    });
  } catch (error) {
    console.error('M-Pesa initiation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * M-Pesa callback endpoint
 */
router.post('/mpesa/callback', express.json(), async (req, res) => {
  try {
    const { Body } = req.body;

    // Process M-Pesa callback
    // Extract transaction details and update subscription status

    console.log('M-Pesa callback received:', Body);

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

/**
 * Create Payoneer payment
 */
router.post('/payoneer/create-payment', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const payment = await paymentService.createPayoneerPayment(
      userId,
      userEmail,
      planId
    );

    res.json({
      success: true,
      paymentId: payment.paymentId,
      paymentUrl: payment.paymentUrl,
    });
  } catch (error) {
    console.error('Payoneer payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Payoneer webhook endpoint
 */
router.post('/payoneer/webhook', express.json(), async (req, res) => {
  try {
    // Process Payoneer webhook
    // Update subscription status based on payment status

    res.json({ received: true });
  } catch (error) {
    console.error('Payoneer webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Cancel subscription
 */
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const { subscriptionId, provider } = req.body;

    const result = await paymentService.cancelSubscription(subscriptionId, provider);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get subscription status
 */
router.get('/subscription/status', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Check if user is a demo user
    if (paymentService.isDemoUser(user.email)) {
      return res.json({
        success: true,
        subscription: {
          status: 'active',
          type: 'demo',
          features: 'all',
          message: 'Demo account with full access',
        },
      });
    }

    // Check regular subscription status
    const hasAccess = paymentService.hasActiveSubscription(user);

    res.json({
      success: true,
      subscription: {
        status: user.subscriptionStatus || 'inactive',
        hasAccess: hasAccess,
        trialEndDate: user.trialEndDate,
        currentPeriodEnd: user.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Check if user is demo user
 */
router.get('/is-demo-user', authenticate, async (req, res) => {
  try {
    const isDemo = paymentService.isDemoUser(req.user.email);

    res.json({
      success: true,
      isDemoUser: isDemo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
