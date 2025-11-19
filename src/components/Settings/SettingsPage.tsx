import React, { useState, useEffect } from 'react';
import { Settings, Bell, Globe, Shield, Database, Key, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useToast } from '../ui/use-toast';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    weather: boolean;
    pest: boolean;
    irrigation: boolean;
    marketing: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    units: string;
    timezone: string;
  };
  privacy: {
    profileVisible: boolean;
    shareData: boolean;
    analytics: boolean;
  };
}

const SettingsPage: React.FC = () => {
  // const { user } = useAuth(); // Removed unused variable
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      weather: true,
      pest: true,
      irrigation: false,
      marketing: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      units: 'metric',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    privacy: {
      profileVisible: true,
      shareData: false,
      analytics: true
    }
  });

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // For now, we'll use mock settings since the API doesn't exist
        // In a real implementation, you would fetch from the API
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Settings are already initialized with default values
      } catch (error) {
        // Error handling for loading settings
        toast({
          title: 'Error',
          description: 'Failed to load settings. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleNotificationChange = (key: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePreferenceChange = <K extends keyof UserSettings['preferences']>(
    key: K,
    value: UserSettings['preferences'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy']) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      // For now, we'll mock the save functionality since the API doesn't exist
      // In a real implementation, you would save to the API
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully!',
        variant: 'default'
      });
    } catch (error) {
      // Error handling for saving settings
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // For now, we'll mock the export functionality since the API doesn't exist
      // In a real implementation, you would trigger data export via API
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Export Started',
        description: 'Your data export has been started. You will receive an email with a download link when it\'s ready.',
        variant: 'default'
      });
    } catch (error) {
      // Error handling for exporting data
      toast({
        title: 'Error',
        description: 'Failed to start data export. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      try {
        // For now, we'll mock the delete functionality since the API doesn't exist
        // In a real implementation, you would call the account deletion API
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: 'Account Deletion Requested',
          description: 'Your account deletion request has been received. You will receive a confirmation email to complete the process.',
          variant: 'default'
        });
      } catch (error) {
        // Error handling for deleting account
        toast({
          title: 'Error',
          description: 'Failed to process account deletion. Please contact support.',
          variant: 'destructive'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account preferences and privacy settings</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          className="flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries({
            email: { label: 'Email Notifications', description: 'Receive notifications via email' },
            push: { label: 'Push Notifications', description: 'Receive push notifications in browser' },
            weather: { label: 'Weather Alerts', description: 'Get notified about severe weather conditions' },
            pest: { label: 'Pest & Disease Alerts', description: 'Notifications about potential pest outbreaks' },
            irrigation: { label: 'Irrigation Alerts', description: 'Get reminders for watering schedules' },
            marketing: { label: 'Marketing Emails', description: 'Receive updates about new features and promotions' }
          }).map(([key, { label, description }]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof UserSettings['notifications']]}
                  onChange={() => handleNotificationChange(key as keyof UserSettings['notifications'])}
                  className="sr-only peer"
                  disabled={isSaving}
                  aria-label={`${label} notification toggle`}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your application experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSaving}
                aria-label="Select application theme"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSaving}
                aria-label="Select application language"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units
              </label>
              <select
                value={settings.preferences.units}
                onChange={(e) => handlePreferenceChange('units', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSaving}
                aria-label="Select measurement units"
              >
                <option value="metric">Metric (Celsius, mm, ha)</option>
                <option value="imperial">Imperial (Fahrenheit, in, ac)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSaving}
                aria-label="Select timezone for weather data"
              >
                <option value="Africa/Nairobi">Nairobi, Kenya (EAT)</option>
                <option value="UTC">UTC</option>
                {/* Add more timezones as needed */}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Profile Visibility</h4>
              <p className="text-sm text-gray-500">Make your profile visible to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.profileVisible}
                onChange={() => handlePrivacyChange('profileVisible')}
                className="sr-only peer"
                disabled={isSaving}
                aria-label="Toggle profile visibility setting"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Analytics</h4>
              <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.analytics}
                onChange={() => handlePrivacyChange('analytics')}
                className="sr-only peer"
                disabled={isSaving}
                aria-label="Toggle analytics sharing setting"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Change Password</h4>
            <Button variant="outline" onClick={() => {}} disabled={isSaving} aria-label="Change password">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-red-100 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Export Your Data</h4>
            <p className="text-sm text-gray-600 mb-3">Download a copy of your personal data</p>
            <Button variant="outline" onClick={handleExportData} disabled={isSaving} aria-label="Export user data">
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="pt-4 border-t border-red-100">
            <h4 className="font-medium text-red-700">Delete Account</h4>
            <p className="text-sm text-red-600 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isSaving}
              aria-label="Delete account"
            >
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;