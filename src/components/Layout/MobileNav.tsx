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
    <div className={cn(
      "lg:hidden fixed bottom-0 left-0 right-0 z-50",
      "bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg",
      "safe-bottom"
    )}>
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'py-2 px-1 text-xs font-medium',
                'touch-target transition-all duration-200',
                'hover:bg-green-50/50',
                isActive ? 'text-green-600' : 'text-gray-500'
              )}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator - animated bar */}
              <div
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-green-600',
                  'transition-all duration-300',
                  isActive ? 'w-12 opacity-100' : 'w-0 opacity-0'
                )}
              />
              
              {/* Icon with scale animation on active */}
              <div className={cn(
                'relative transition-transform duration-200',
                isActive && 'scale-110'
              )}>
                <item.icon
                  className={cn(
                    'h-6 w-6 mb-1 transition-colors duration-200',
                    isActive ? 'text-green-600' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                
                {/* Pulse effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-green-600/10 animate-pulse" />
                )}
              </div>
              
              {/* Label with smooth color transition */}
              <span className={cn(
                'truncate transition-all duration-200',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;