import React, { useState } from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { LoadingButton } from '../ui/loading-overlay';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PayPalPaymentProps {
  planId: string;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({ planId }) => {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/payments/paypal/create-subscription',
        { planId },
        {
          headers: {
            'x-api-key': localStorage.getItem('token'),
          },
        }
      );

      if (response.data.success && response.data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = response.data.approvalUrl;
      } else {
        toast.error('Failed to create PayPal subscription');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
      setLoading(false);
    }
  };

  const handleTestPayment = () => {
    toast.success('Test Mode: PayPal payment simulation successful!');
    setTimeout(() => {
      toast.success('Your subscription is now active (Test Mode)');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">PayPal Payment</h3>
        <DollarSign className="w-6 h-6 text-blue-600" />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Fast & Secure PayPal Checkout
            </p>
            <p className="text-xs text-blue-700">
              You'll be redirected to PayPal to complete your payment securely. You can pay with your
              PayPal balance, linked bank account, or credit/debit card.
            </p>
          </div>
        </div>
      </div>

      {/* Test Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="paypalTestMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="paypalTestMode" className="text-sm font-medium text-gray-900 cursor-pointer">
            Enable Test Mode
          </label>
        </div>
        <span className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
          For testing only
        </span>
      </div>

      {testMode && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
          <p className="font-medium text-gray-900">PayPal Sandbox Test Account:</p>
          <div className="space-y-1 text-gray-700">
            <p><strong>Email:</strong> sb-test@business.example.com</p>
            <p><strong>Password:</strong> test1234</p>
            <p className="text-xs text-gray-600 mt-2">
              Use PayPal sandbox credentials for testing payments
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <LoadingButton
          isLoading={loading}
          loadingText="Redirecting to PayPal..."
          onClick={testMode ? handleTestPayment : handlePayment}
          className={cn(
            "w-full bg-blue-600 hover:bg-blue-700 text-white",
            "h-12 text-base font-semibold",
            "transition-all touch-target"
          )}
        >
          {testMode ? (
            'Simulate PayPal Payment (Test Mode)'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Continue with PayPal
              <ExternalLink className="w-4 h-4" />
            </span>
          )}
        </LoadingButton>

        <p className="text-xs text-center text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          You will be charged $9.99/month after your 14-day free trial.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Accepted payment methods:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">PayPal Balance</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">Bank Account</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">Credit/Debit</span>
        </div>
      </div>
    </div>
  );
};

export default PayPalPayment;
