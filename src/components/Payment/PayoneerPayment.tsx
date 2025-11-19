import React, { useState } from 'react';
import { CreditCard, ExternalLink, Globe } from 'lucide-react';
import { LoadingButton } from '../ui/loading-overlay';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PayoneerPaymentProps {
  planId: string;
}

const PayoneerPayment: React.FC<PayoneerPaymentProps> = ({ planId }) => {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/payments/payoneer/create-payment',
        { planId },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_AIMLAPI_AI_API_KEY,
          },
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        // Redirect to Payoneer
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error('Failed to create Payoneer payment');
        setLoading(false);
      }
    } catch {
      // Error handling for Payoneer payment
      toast.error('Payment failed');
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    setLoading(true);
    
    // Simulate Payoneer redirect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Test Mode: Redirecting to Payoneer...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Test Mode: Payment method selected');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Test Mode: Payment processed successfully!');
    
    // Set demo user flag for future sessions
    localStorage.setItem('demoUser', 'true');
    
    setTimeout(() => {
      toast.success('Your subscription is now active (Test Mode)');
      setLoading(false);
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payoneer Payment</h3>
        <Globe className="w-6 h-6 text-orange-600" />
      </div>

      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900 mb-1">
              International Payment Solution
            </p>
            <p className="text-xs text-orange-700">
              You'll be redirected to Payoneer's secure checkout page. Payoneer accepts payments
              from over 200 countries with support for multiple currencies.
            </p>
          </div>
        </div>
      </div>

      {/* Test Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="payoneerTestMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="payoneerTestMode" className="text-sm font-medium text-gray-900 cursor-pointer">
            Enable Test Mode
          </label>
        </div>
        <span className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
          For testing only
        </span>
      </div>

      <div className="space-y-4">
        {/* Features */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">Payoneer Features:</p>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>Multiple currency support</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>Available in 200+ countries</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-orange-600" />
              <span>Bank transfer and card payments</span>
            </div>
          </div>
        </div>

        {testMode && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <p className="font-medium text-gray-900">Test Mode Information:</p>
            <div className="space-y-1 text-gray-700">
              <p className="text-xs text-gray-600">
                In test mode, you can simulate a successful payment without actual charges.
                Use this to test the payment flow and subscription activation.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <LoadingButton
          isLoading={loading}
          loadingText="Redirecting to Payoneer..."
          onClick={testMode ? handleTestPayment : handlePayment}
          className={cn(
            "w-full bg-orange-600 hover:bg-orange-700 text-white",
            "h-12 text-base font-semibold",
            "transition-all touch-target"
          )}
        >
          {testMode ? (
            'Simulate Payoneer Payment (Test Mode)'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Continue with Payoneer
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
          <span className="text-xs text-gray-500">Credit/Debit Card</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">Bank Transfer</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">Local Options</span>
        </div>
      </div>
    </div>
  );
};

export default PayoneerPayment;
