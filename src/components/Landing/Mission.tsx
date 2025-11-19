import React from 'react';
import { Target, Globe, Users, Leaf } from 'lucide-react';

const Mission: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To increase crop yields across East and Central Africa by creating an AI advisory platform that empowers smallholder farmers with accessible agricultural technology.',
      color: 'bg-green-500'
    },
    {
      icon: Globe,
      title: 'Our Reach',
      description: 'Serving smallholder farmers across 15 countries in East and Central Africa with localized solutions and multilingual support.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Our Impact',
      description: 'Over 50,000 farmers have increased their yields by an average of 25% using our AI-powered recommendations and educational resources.',
      color: 'bg-purple-500'
    },
    {
      icon: Leaf,
      title: 'Our Vision',
      description: 'To foster sustainable and resilient food systems through innovative AI technology that promotes environmental sustainability.',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Transforming Agriculture in Africa
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We believe that technology and traditional farming knowledge can work together to create 
            sustainable agricultural prosperity across East and Central Africa. Our platform makes 
            precision agriculture accessible to all farmers, regardless of their technical background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="flex items-start space-x-6 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`${value.color} p-3 rounded-lg flex-shrink-0`}>
                <value.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join Our Growing Community
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Be part of the agricultural revolution in Africa. Together, we can build a more sustainable 
            and prosperous future for farming communities across the continent.
          </p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mission;