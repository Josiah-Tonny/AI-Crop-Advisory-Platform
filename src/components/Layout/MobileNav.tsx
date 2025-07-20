import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Sprout, 
  CloudRain, 
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Advisory', href: '/ai-advisory', icon: Brain },
    { name: 'Weather', href: '/weather', icon: CloudRain },
    { name: 'Crops', href: '/crops', icon: Sprout },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
              location.pathname === item.href
                ? 'text-green-600'
                : 'text-gray-500 hover:text-green-600'
            )}
          >
            <item.icon
              className={cn(
                'h-6 w-6 mb-1',
                location.pathname === item.href ? 'text-green-600' : 'text-gray-400'
              )}
            />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;