import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Loader2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { authService } from '../../services/authService';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  farmSize: string;
  cropTypes: string[];
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    farmSize: '',
    cropTypes: []
  });
  
  // Mock user data
  const mockUser = {
    firstName: 'John',
    lastName: 'Farmer',
    email: 'john.farmer@example.com',
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    farmSize: 'medium',
    cropTypes: ['Maize', 'Beans', 'Tomato'],
    subscriptionTier: 'premium',
    createdAt: '2023-01-15T00:00:00Z'
  };

  // Initialize form data when user data is available
  useEffect(() => {
    // Use mock user data if no user data is available
    const currentUser = user || mockUser;
    
    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      location: currentUser.location || '',
      farmSize: currentUser.farmSize || '',
      cropTypes: currentUser.cropTypes || []
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCropChange = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter(c => c !== crop)
        : [...prev.cropTypes, crop]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(formData);
      
      if (response.success && response.user) {
        updateUser(response.user);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully!',
          variant: 'default'
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: unknown) {
      // Error handling for profile update
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        farmSize: user.farmSize || '',
        cropTypes: user.cropTypes || []
      });
    }
    setIsEditing(false);
  };

  const cropOptions = [
    'Maize', 'Rice', 'Wheat', 'Beans', 'Cassava', 'Sweet Potato',
    'Banana', 'Coffee', 'Tea', 'Sugarcane', 'Cotton', 'Tomato',
    'Onion', 'Cabbage', 'Carrot', 'Other'
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowHelp(!showHelp)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Profile Help
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
              <li>Your profile information helps us provide personalized agricultural recommendations</li>
              <li>Accurate location data ensures relevant weather and soil information</li>
              <li>Specify your crop types to receive targeted advice and alerts</li>
              <li>Farm size affects recommendations for inputs and equipment</li>
              <li>Keep your contact information updated to receive important notifications</li>
              <li>Account information shows your subscription status and member since date</li>
            </ul>
            <p className="mt-2 text-blue-700 text-sm">
              All information is kept confidential and used solely to improve your farming experience.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-16 h-16 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{(user || mockUser).firstName} {(user || mockUser).lastName}</h3>
              <p className="text-gray-500">{(user || mockUser).email}</p>
            </div>
            {isEditing && (
              <Button variant="outline" size="sm" disabled={isLoading}>
                Change Picture
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    aria-label="First Name"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{(user || mockUser).firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    aria-label="Last Name"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{(user || mockUser).lastName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    aria-label="Phone Number"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    aria-label="Location"
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{user.location || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Size
                </label>
                {isEditing ? (
                  <select
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                    aria-label="Farm Size"
                  >
                    <option value="">Select farm size</option>
                    <option value="small">Small (&lt; 1 hectare)</option>
                    <option value="medium">Medium (1-5 hectares)</option>
                    <option value="large">Large (&gt; 5 hectares)</option>
                  </select>
                ) : (
                  <span className="capitalize">
                    {user.farmSize ? 
                      user.farmSize === 'small' ? '< 1 hectare' :
                      user.farmSize === 'medium' ? '1-5 hectares' :
                      user.farmSize === 'large' ? '> 5 hectares' :
                      user.farmSize : 'Not specified'}
                  </span>
                )}
              </div>
            </div>

            {/* Crop Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Types
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {cropOptions.map((crop) => (
                    <label key={crop} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.cropTypes.includes(crop)}
                        onChange={() => handleCropChange(crop)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        disabled={isLoading}
                      />
                      <span className="ml-2 text-sm text-gray-700">{crop}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.cropTypes && user.cropTypes.length > 0 ? (
                    user.cropTypes.map((crop: string) => (
                      <span
                        key={crop}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No crops specified</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Member Since</p>
              <p className="text-lg font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p className="text-lg font-semibold capitalize">
                {user.subscriptionTier || 'Free'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
