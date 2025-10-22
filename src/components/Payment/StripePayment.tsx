import React, { useState } from 'react';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { LoadingButton } from '../ui/loading-overlay';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StripePaymentProps {
  planId: string;
}

const StripePayment: React.FC<StripePaymentProps> = ({ planId }) => {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/payments/stripe/create-checkout-session',
        { planId },
        {
          headers: {
            'x-api-key': localStorage.getItem('token'),
          },
        }
      );

      if (response.data.success && response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
      setLoading(false);
    }
  };

  const handleTestPayment = () => {
    toast.success('Test Mode: Payment simulation successful!');
    setTimeout(() => {
      toast.success('Your subscription is now active (Test Mode)');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Credit/Debit Card Payment
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Lock className="w-4 h-4" />
          <span>Secured by Stripe</span>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Secure Card Payment
            </p>
            <p className="text-xs text-blue-700">
              You'll be redirected to Stripe's secure checkout page to complete your payment.
              All card information is handled securely by Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Test Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="testMode" className="text-sm font-medium text-gray-900 cursor-pointer">
            Enable Test Mode
          </label>
        </div>
        <span className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
          For testing only
        </span>
      </div>

      {testMode && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
          <p className="font-medium text-gray-900">Test Card Numbers:</p>
          <div className="space-y-1 text-gray-700">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
            <p><strong>3D Secure:</strong> 4000 0027 6000 3184</p>
            <p className="text-xs text-gray-600 mt-2">
              Use any future expiry date, any 3-digit CVC, and any ZIP code
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <LoadingButton
          isLoading={loading}
          loadingText="Redirecting to Stripe..."
          onClick={testMode ? handleTestPayment : handlePayment}
          className={cn(
            "w-full bg-blue-600 hover:bg-blue-700 text-white",
            "h-12 text-base font-semibold",
            "transition-all touch-target"
          )}
        >
          {testMode ? 'Simulate Payment (Test Mode)' : 'Continue to Stripe Checkout'}
        </LoadingButton>

        <p className="text-xs text-center text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          You will be charged ${9.99}/month after your 14-day free trial.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4 border-t">
        <img src="/stripe-badge.svg" alt="Stripe" className="h-6 opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
        <span className="text-xs text-gray-500">Powered by Stripe</span>
      </div>
    </div>
  );
};

export default StripePayment;
