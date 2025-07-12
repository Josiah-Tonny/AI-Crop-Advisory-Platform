import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, TrendingUp, Users, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Hero: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Transform Your Farm with
                <span className="block text-green-200">AI-Powered Insights</span>
              </h1>
              <p className="text-xl text-green-100 leading-relaxed">
                Empowering smallholder farmers across East and Central Africa with intelligent agricultural solutions. 
                Increase yields, optimize resources, and build sustainable farming practices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="border-2 border-green-200 text-green-100 px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-200">50K+</div>
                <div className="text-sm text-green-100">Farmers Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-200">25%</div>
                <div className="text-sm text-green-100">Yield Increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-200">15</div>
                <div className="text-sm text-green-100">Countries</div>
              </div>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-green-600 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
                  <Sprout className="h-8 w-8 text-green-200 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Crop Monitoring</h3>
                  <p className="text-sm text-green-100">AI-powered analysis of crop health and growth patterns</p>
                </div>
                <div className="bg-green-600 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-green-200 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Yield Prediction</h3>
                  <p className="text-sm text-green-100">Accurate forecasting to maximize your harvest</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-green-600 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
                  <Users className="h-8 w-8 text-green-200 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Community</h3>
                  <p className="text-sm text-green-100">Connect with fellow farmers and share knowledge</p>
                </div>
                <div className="bg-green-600 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
                  <Globe className="h-8 w-8 text-green-200 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Weather Alerts</h3>
                  <p className="text-sm text-green-100">Real-time weather updates and farming recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;