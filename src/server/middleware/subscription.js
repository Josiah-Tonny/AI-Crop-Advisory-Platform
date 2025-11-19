/**
 * Subscription Middleware
 * Checks if user has active subscription or valid trial
 */

import paymentService from '../services/paymentService.js';

/**
 * Middleware to check if user has active subscription
 */
export const requireSubscription = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Check if user has access
    const hasAccess = paymentService.hasActiveSubscription(user);

    if (hasAccess) {
      // User has access, continue
      next();
    } else {
      // User needs to subscribe
      return res.status(403).json({
        success: false,
        error: 'Active subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Please subscribe to access this feature',
        trialExpired: user.subscriptionStatus === 'trialing' && new Date(user.trialEndDate) < new Date(),
      });
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    throw error;
    return res.status(500).json({
      success: false,
      error: 'Failed to verify subscription status',
    });
  }
};

/**
 * Middleware to check if user is in trial period
 */
export const requireTrialOrActive = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Demo users always have access
    if (paymentService.isDemoUser(user.email)) {
      return next();
    }

    // Check if user has active subscription or valid trial
    const hasAccess = paymentService.hasActiveSubscription(user);

    if (hasAccess) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Subscription or trial required',
        code: 'TRIAL_EXPIRED',
        message: 'Your trial period has ended. Please subscribe to continue',
      });
    }
  } catch (error) {
    console.error('Trial check error:', error);
    throw error;
    return res.status(500).json({
      success: false,
      error: 'Failed to verify trial status',
    });
  }
};

/**
 * Middleware to add subscription info to response
 */
export const addSubscriptionInfo = (req, res, next) => {
  try {
    if (req.user) {
      req.user.hasActiveSubscription = paymentService.hasActiveSubscription(req.user);
      req.user.isDemoUser = paymentService.isDemoUser(req.user.email);
    }
    next();
  } catch (error) {
    console.error('Add subscription info error:', error);
    throw error;
    next();
  }
};

export default {
  requireSubscription,
  requireTrialOrActive,
  addSubscriptionInfo,
};
