import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Sprout, Loader2, Sparkles, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import toast from 'react-hot-toast';
import Logo from '../ui/Logo';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    farmSize: '',
    cropTypes: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const cropOptions = [
    'Maize', 'Rice', 'Wheat', 'Beans', 'Cassava', 'Sweet Potato',
    'Banana', 'Coffee', 'Tea', 'Sugarcane', 'Cotton', 'Tomato',
    'Onion', 'Cabbage', 'Carrot', 'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCropChange = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter(c => c !== crop)
        : [...prev.cropTypes, crop]
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
        farmSize: formData.farmSize,
        cropTypes: formData.cropTypes
      };

      const success = await register(userData);
      
      if (success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error: unknown) {
      // Type guard to check if error has response property
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/images/FARM AI.jpeg" 
              alt="FARM AI Logo"
              className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Create Your Account
            </h1>
            <p className="text-gray-600">Join FARM AI and transform your farming experience</p>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl overflow-hidden">
          <CardHeader className="text-center relative z-10 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Create Your Account
            </CardTitle>
            <p className="text-sm text-center text-gray-500">
              Fill in your details to get started with FARM AI
            </p>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Password"
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

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors group"
                    >
                      <div className="p-1 rounded-full hover:bg-green-50 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                  Farm Size (Optional)
                </label>
                <select
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gradient-to-r from-gray-50 to-white transition-all duration-300 transform focus:scale-[1.01] focus:shadow-lg"
                  aria-label="Select farm size"
                >
                  <option value="">Select farm size</option>
                  <option value="small">Small (&lt; 1 hectare)</option>
                  <option value="medium">Medium (1-5 hectares)</option>
                  <option value="large">Large (&gt; 5 hectares)</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                  Crop Types (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
                  {cropOptions.map((crop) => (
                    <label key={crop} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.cropTypes.includes(crop)}
                        onChange={() => handleCropChange(crop)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 transition-all duration-200 group-hover:scale-110"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium transition-colors group-hover:text-green-600">{crop}</span>
                    </label>
                  ))}
                </div>
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </Button>
            </form>

          </CardContent>
          
          {/* Footer with sign in link */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;