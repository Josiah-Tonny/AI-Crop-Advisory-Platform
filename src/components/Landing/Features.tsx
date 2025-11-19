import React from 'react';
import { 
  Brain, 
  CloudRain, 
  TestTube, 
  BookOpen, 
  BarChart3, 
  Smartphone,
  Shield,
  Users
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized crop recommendations based on your soil, climate, and farming history using advanced machine learning.',
      color: 'bg-purple-500'
    },
    {
      icon: CloudRain,
      title: 'Weather Forecasting',
      description: 'Access accurate weather predictions, rainfall patterns, and agricultural alerts to plan your farming activities.',
      color: 'bg-blue-500'
    },
    {
      icon: TestTube,
      title: 'Soil Health Analysis',
      description: 'Comprehensive soil testing and analysis with actionable insights to optimize nutrient management.',
      color: 'bg-green-500'
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Access farming guides, best practices, and educational content tailored to your crops and region.',
      color: 'bg-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your farm performance, yield trends, and ROI with detailed analytics and reporting.',
      color: 'bg-indigo-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Access all features on your smartphone, designed for use in the field with offline capabilities.',
      color: 'bg-pink-500'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Identify and mitigate farming risks with predictive analytics and early warning systems.',
      color: 'bg-red-500'
    },
    {
      icon: Users,
      title: 'Community Platform',
      description: 'Connect with other farmers, share experiences, and learn from the agricultural community.',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with practical farming expertise 
            to help you maximize yields and build sustainable agricultural practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group hover:shadow-lg transition-shadow duration-300 rounded-lg p-6 border border-gray-200">
              <div className={`${feature.color} p-3 rounded-lg inline-block mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;