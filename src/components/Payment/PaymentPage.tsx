import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// UI Components
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Payment method components
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';
import MpesaPayment from './MpesaPayment';
import PayoneerPayment from './PayoneerPayment';

type PaymentMethod = 'stripe' | 'paypal' | 'mpesa' | 'payoneer';

interface SubscriptionPlan {
  name: string;
  price: number;
  currency: string;
  interval: string;
  trialDays: number;
  features: string[];
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [plan, setPlan] = useState<SubscriptionPlan | null>({
    id: 'monthly',
    name: 'Monthly Plan',
    price: 999,
    currency: 'USD',
    interval: 'month',
    trialDays: 14,
    features: [
      'Unlimited crop recommendations',
      'Advanced pest detection',
      'Weather integration',
      'Email support',
      'Mobile app access',
      'Priority customer support'
    ]
  });
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Debugging - log when component mounts
  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    // Check if user is demo user
    // checkDemoStatus();
    // Load subscription plan
    // loadPlan();
  }, []);

  const checkDemoStatus = async () => {
    try {
      const response = await axios.get('/api/payments/is-demo-user');
      setIsDemoUser(response.data.isDemoUser);

      if (response.data.isDemoUser) {
        toast.success('You have a demo account with full access!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Error checking demo status:', error);
      // Mock demo status for development
      const isDemo = localStorage.getItem('demoUser') === 'true';
      if (isDemo) {
        setIsDemoUser(true);
        toast.success('Demo account detected - Full access enabled!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    }
  };

  const loadPlan = async () => {
    try {
      const response = await axios.get('/api/payments/plans');
      setPlan(response.data.plans?.monthly);
    } catch (error) {
      console.error('Error loading plan:', error);
      // Error handling for loading plan
      // Use mock data if API fails
      const mockPlan = {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 999, // Price in cents (displayed as $9.99)
        currency: 'USD',
        interval: 'month',
        trialDays: 14,
        features: [
          'Unlimited crop recommendations',
          'Advanced pest detection',
          'Weather integration',
          'Email support',
          'Mobile app access',
          'Priority customer support'
        ]
      };
      setPlan(mockPlan);
      toast.error('Using demo data - Failed to load subscription plan');
    }
  };

  // Fallback timeout to ensure page loads even if API calls fail
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!plan && !isDemoUser) {
        const mockPlan = {
          id: 'monthly',
          name: 'Monthly Plan',
          price: 999,
          currency: 'USD',
          interval: 'month',
          trialDays: 14,
          features: [
            'Unlimited crop recommendations',
            'Advanced pest detection',
            'Weather integration',
            'Email support',
            'Mobile app access',
            'Priority customer support'
          ]
        };
        setPlan(mockPlan);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [plan, isDemoUser]);

  const paymentMethods = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: CreditCard,
      available: true,
      popular: true,
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      description: 'Fast & secure PayPal checkout',
      icon: DollarSign,
      available: true,
      popular: false,
    },
    {
      id: 'mpesa' as PaymentMethod,
      name: 'M-Pesa',
      description: 'Mobile money (Kenya)',
      icon: Smartphone,
      available: true,
      popular: false,
    },
    {
      id: 'payoneer' as PaymentMethod,
      name: 'Payoneer',
      description: 'International payments',
      icon: CreditCard,
      available: true,
      popular: false,
    },
  ];

  if (isDemoUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="max-w-md w-full text-center p-8 shadow-lg">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Account</h2>
            <p className="text-gray-600">
              You have full access to all features without needing a subscription!
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Choose Your Payment Method
          </h1>
          <p className="text-gray-600 text-lg">
            Start your {plan.trialDays}-day free trial today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-lg">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${(plan.price / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {plan.trialDays} days free trial
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Secure Payment
                      </p>
                      <p className="text-xs text-blue-700">
                        Your payment information is encrypted and secure. Cancel anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card className="shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      disabled={!method.available}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all text-left",
                        "hover:shadow-md touch-target",
                        selectedMethod === method.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300",
                        !method.available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {method.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-green-600 text-white">
                          Popular
                        </Badge>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            selectedMethod === method.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          <method.icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">
                            {method.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {method.description}
                          </div>
                        </div>

                        {selectedMethod === method.id && (
                          <Check className="w-5 h-5 text-green-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Payment Form */}
            <Card className="shadow-lg">
              <div className="p-6">
                {selectedMethod === 'stripe' && <StripePayment planId="monthly" />}
                {selectedMethod === 'paypal' && <PayPalPayment planId="monthly" />}
                {selectedMethod === 'mpesa' && <MpesaPayment planId="monthly" />}
                {selectedMethod === 'payoneer' && <PayoneerPayment planId="monthly" />}
              </div>
            </Card>

            {/* Trust Badges */}
            <Card className="bg-gray-50 shadow-lg">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">SSL Encrypted</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">14-Day Free Trial</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Cancel Anytime</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
