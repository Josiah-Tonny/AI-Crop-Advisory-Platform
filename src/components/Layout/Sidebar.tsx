import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Sprout, 
  CloudRain, 
  TestTube, 
  Bug, 
  Droplets,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Advisory', href: '/ai-advisory', icon: Brain },
    { name: 'Weather', href: '/weather', icon: CloudRain },
    { name: 'Crops', href: '/crops', icon: Sprout },
    { name: 'Soil Analysis', href: '/soil', icon: TestTube },
    { name: 'Pest Control', href: '/pest-control', icon: Bug },
    { name: 'Irrigation', href: '/irrigation', icon: Droplets },
    { name: 'Education', href: '/education', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const secondaryNavigation = [
    { name: 'Subscription', href: '/payment', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriAI</h1>
              <p className="text-xs text-gray-500">Smart Farming Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                          : 'text-gray-700 hover:text-green-700 hover:bg-green-50',
                        'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-all duration-200'
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? 'bg-gray-50 text-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium'
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;