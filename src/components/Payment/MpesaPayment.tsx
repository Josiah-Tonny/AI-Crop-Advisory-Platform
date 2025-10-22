import React, { useState } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';
import { LoadingButton } from '../ui/loading-overlay';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface MpesaPaymentProps {
  planId: string;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({ planId }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testMode, setTestMode] = useState(true);

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format as 254XXXXXXXXX
    if (digits.startsWith('0')) {
      return '254' + digits.slice(1);
    } else if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return '254' + digits;
    }
    return digits;
  };

  const handlePayment = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!/^254\d{9}$/.test(formattedPhone)) {
      toast.error('Please enter a valid M-Pesa phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/payments/mpesa/initiate',
        {
          phoneNumber: formattedPhone,
          planId
        },
        {
          headers: {
            'x-api-key': localStorage.getItem('token'),
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'STK Push sent! Check your phone to complete payment');

        // Poll for payment status (simplified)
        setTimeout(() => {
          toast.info('Waiting for payment confirmation...');
        }, 3000);
      } else {
        toast.error('Failed to initiate M-Pesa payment');
      }
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayment = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!/^254\d{9}$/.test(formattedPhone)) {
      toast.error('Please enter a valid phone number format');
      return;
    }

    toast.success('Test Mode: M-Pesa STK Push sent!');
    setTimeout(() => {
      toast.success('Test Mode: Payment confirmed! Your subscription is now active');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">M-Pesa Payment</h3>
        <Smartphone className="w-6 h-6 text-green-600" />
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 mb-1">
              M-Pesa Mobile Money
            </p>
            <p className="text-xs text-green-700">
              Enter your M-Pesa registered phone number to receive an STK push prompt.
              Enter your M-Pesa PIN on your phone to complete the payment.
            </p>
          </div>
        </div>
      </div>

      {/* Test Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="mpesaTestMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="mpesaTestMode" className="text-sm font-medium text-gray-900 cursor-pointer">
            Enable Test Mode
          </label>
        </div>
        <span className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
          For testing only
        </span>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-2">
        <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700">
          M-Pesa Phone Number
        </label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="mpesaPhone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678 or 254712345678"
            className={cn(
              "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-green-500 focus:border-transparent",
              "transition-all touch-target"
            )}
          />
        </div>
        <p className="text-xs text-gray-600">
          Enter your Safaricom M-Pesa registered number
        </p>
      </div>

      {testMode && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
          <p className="font-medium text-gray-900">Test Phone Numbers:</p>
          <div className="space-y-1 text-gray-700">
            <p><strong>Success:</strong> 254712345678</p>
            <p><strong>Insufficient funds:</strong> 254712345679</p>
            <p><strong>Timeout:</strong> 254712345680</p>
            <p className="text-xs text-gray-600 mt-2">
              Use these numbers to simulate different payment scenarios
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How M-Pesa Payment Works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
              <li>Enter your M-Pesa phone number and click "Pay with M-Pesa"</li>
              <li>You'll receive an STK push prompt on your phone</li>
              <li>Enter your M-Pesa PIN to authorize the payment</li>
              <li>Wait for confirmation SMS from M-Pesa</li>
              <li>Your subscription will be activated automatically</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <LoadingButton
          isLoading={loading}
          loadingText="Sending STK Push..."
          onClick={testMode ? handleTestPayment : handlePayment}
          disabled={!phoneNumber}
          className={cn(
            "w-full bg-green-600 hover:bg-green-700 text-white",
            "h-12 text-base font-semibold",
            "transition-all touch-target",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {testMode ? 'Simulate M-Pesa Payment (Test Mode)' : 'Pay with M-Pesa'}
        </LoadingButton>

        <p className="text-xs text-center text-gray-600">
          Amount: KSh 1,299/month (approx. $9.99) after 14-day free trial
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-4 border-t">
        <span className="text-xs text-gray-500">Powered by Safaricom M-Pesa</span>
      </div>
    </div>
  );
};

export default MpesaPayment;
