import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, Sprout, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        toast.success('Login successful!');
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error: unknown) {
      // Error handling for login
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
      // Login error occurred
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full opacity-20 blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/60 relative overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/50 opacity-50"></div>
        
        <CardHeader className="text-center relative z-10 pb-6">
          <div className="flex items-center justify-center mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Sign in to your AGRI-ADVISOR account
            <CheckCircle className="w-4 h-4 text-green-500" />
          </p>
        </CardHeader>
        
        <CardContent className="relative z-10">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors group"
                >
                  <div className="p-1 rounded-full hover:bg-green-50 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 transition-all duration-200 group-hover:scale-110"
                />
                <span className="ml-2 text-sm text-gray-600 font-medium transition-colors group-hover:text-gray-800">Remember me</span>
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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

          <div className="mt-8 text-center pt-6 border-t border-gray-200/60">
            <p className="text-gray-600 font-medium flex items-center justify-center gap-2">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-green-600 hover:text-green-700 font-bold transition-all duration-300 hover:underline flex items-center gap-1 group"
              >
                Sign up
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;