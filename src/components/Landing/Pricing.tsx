import React from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { SubscriptionPlan } from '../../types';
import PaymentModal from '../Payments/PaymentModal';

interface PricingProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void;
}

const Pricing: React.FC<PricingProps> = ({ onPlanSelect }) => {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
    } else {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'KES',
      duration: 'forever',
      features: [
        'Basic weather forecasts',
        'Limited crop recommendations',
        'Community access',
        'Basic educational resources',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2500,
      currency: 'KES',
      duration: 'month',
      popular: true,
      features: [
        'Advanced AI recommendations',
        'Detailed weather analytics',
        'Soil health analysis',
        'Unlimited crop monitoring',
        'Priority support',
        'Advanced analytics',
        'Custom alerts',
        'Offline access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 5000,
      currency: 'KES',
      duration: 'month',
      features: [
        'Everything in Premium',
        'Custom AI models',
        'Multi-farm management',
        'API access',
        'White-label solutions',
        'Dedicated support',
        'Custom integrations',
        'Training sessions'
      ]
    }
  ];

  const getIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Zap className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getIconColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-500';
      case 'premium':
        return 'text-yellow-500';
      case 'enterprise':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with our free plan and upgrade as your farm grows. All plans include 
            our core features with different levels of access and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-lg shadow-sm p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-green-500 transform scale-105' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              {plan.popular && (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-block p-3 rounded-full bg-gray-100 ${getIconColor(plan.id)} mb-4`}>
                  {getIcon(plan.id)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : `${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-lg text-gray-500 ml-2">
                      {plan.currency}/{plan.duration}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
            <span>✓ Mobile & web access</span>
          </div>
        </div>

        {!onPlanSelect && (
          <PaymentModal 
            isOpen={showPaymentModal} 
            onClose={() => setShowPaymentModal(false)}
            plan={selectedPlan}
            onSuccess={() => {
              setShowPaymentModal(false);
              // Handle successful payment
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Pricing;