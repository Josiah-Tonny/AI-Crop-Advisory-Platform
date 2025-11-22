import React, { useState, useEffect } from 'react';
import { ArrowRight, Sprout, TrendingUp, Users, Globe, CheckCircle, Zap, Award, Play } from 'lucide-react';

const Hero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const user = null; // Replace with actual auth context in your app

  // Animated counter for stats
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (hasAnimated) return;
      
      const increment = end / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
          setHasAnimated(true);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration, hasAnimated]);

    return count;
  };

  const farmers = useCounter(50000);
  const yieldIncrease = useCounter(25);
  const countries = useCounter(15);

  return (
    <div className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-700 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Trusted by 50K+ Farmers</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Award-Winning AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Real-Time Insights</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-600/30 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-100">AI-Powered Agriculture Platform</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
                  Transform Your
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-200 via-emerald-200 to-green-300">
                  Farm with AI
                </span>
              </h1>
              <p className="text-xl text-green-50 leading-relaxed max-w-xl">
                Empowering smallholder farmers across East and Central Africa with intelligent agricultural solutions. 
                Increase yields by up to 25%, optimize resources, and build sustainable farming practices.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => alert(user ? 'Navigate to /dashboard' : 'Navigate to /register')}
                className="group bg-white text-green-800 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="group border-2 border-green-200/50 backdrop-blur-sm bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats with Animation */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-green-600/30">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                  {farmers.toLocaleString()}+
                </div>
                <div className="text-sm text-green-200 mt-1">Farmers Served</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                  {yieldIncrease}%
                </div>
                <div className="text-sm text-green-200 mt-1">Yield Increase</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                  {countries}
                </div>
                <div className="text-sm text-green-200 mt-1">Countries</div>
              </div>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="relative">
            {/* Floating decorative element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5 animate-slideUp">
                <div className="group bg-white/10 backdrop-blur-md p-7 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-green-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sprout className="h-7 w-7 text-green-200" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Crop Monitoring</h3>
                  <p className="text-sm text-green-100 leading-relaxed">AI-powered analysis of crop health and growth patterns</p>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-md p-7 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-emerald-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-emerald-200" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Yield Prediction</h3>
                  <p className="text-sm text-green-100 leading-relaxed">Accurate forecasting to maximize your harvest</p>
                </div>
              </div>
              
              <div className="space-y-5 pt-10 animate-slideUp" style={{animationDelay: '0.2s'}}>
                <div className="group bg-white/10 backdrop-blur-md p-7 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7 text-blue-200" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Community</h3>
                  <p className="text-sm text-green-100 leading-relaxed">Connect with fellow farmers and share knowledge</p>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-md p-7 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-cyan-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="h-7 w-7 text-cyan-200" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">Weather Alerts</h3>
                  <p className="text-sm text-green-100 leading-relaxed">Real-time weather updates and farming recommendations</p>
                </div>
              </div>
            </div>

            {/* Testimonial Badge */}
            <div className="mt-8 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  JM
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-100 italic mb-2">
                    "FARM AI increased my maize yield by 30% in the first season. The weather alerts alone saved my crops twice!"
                  </p>
                  <p className="text-xs text-green-200 font-semibold">James Mwangi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="bg-white rounded-2xl p-2 max-w-4xl w-full animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-white relative">
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
              <div className="text-center">
                <Play className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Demo video would play here</p>
                <p className="text-sm text-gray-400 mt-2">Replace with your video embed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
          animation-fill-mode: both;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default Hero;