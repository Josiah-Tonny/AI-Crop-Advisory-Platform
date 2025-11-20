import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/images/FARM AI.jpeg" 
              alt="FARM AI Logo"
              className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to access your FARM AI dashboard</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 transition-all duration-200 group-hover:scale-110"
                  />
                  <span className="ml-2 text-sm text-gray-600 font-medium transition-colors group-hover:text-gray-800">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors hover:underline flex items-center gap-1 group"
                >
                  Forgot password?
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </Button>
            </form>
          </CardContent>
          
          {/* Footer with sign up link */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;