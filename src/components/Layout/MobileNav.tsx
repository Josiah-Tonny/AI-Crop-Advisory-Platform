import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Sprout, 
  CloudRain, 
  User,
  Sparkles,
  CreditCard
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
    { name: 'Payment', href: '/payment', icon: CreditCard },
  ];

  return (
    <div className={cn(
      "lg:hidden fixed bottom-0 left-0 right-0 z-50",
      "bg-white/95 backdrop-blur-xl border-t border-gray-200/60 shadow-2xl",
      "safe-bottom"
    )}>
      <div className="grid grid-cols-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'py-2.5 px-1 text-xs font-medium',
                'touch-target transition-all duration-300 transform',
                'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-105',
                'group overflow-hidden',
                isActive ? 'text-green-600' : 'text-gray-500'
              )}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator - animated bar */}
              <div
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-sm',
                  'transition-all duration-300',
                  isActive ? 'w-12 opacity-100' : 'w-0 opacity-0'
                )}
              />
              
              {/* Icon with scale animation on active */}
              <div className="relative">
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300',
                  isActive && 'opacity-30 animate-pulse'
                )} />
                <div className={cn(
                  'relative transition-all duration-300 transform',
                  isActive && 'scale-110 rotate-6'
                )}>
                  <item.icon
                    className={cn(
                      'h-6 w-6 mb-1 transition-all duration-300',
                      isActive ? 'text-green-600 drop-shadow-sm' : 'text-gray-400 group-hover:text-green-500'
                    )}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Label with smooth color transition */}
              <span className={cn(
                'truncate transition-all duration-300 font-medium',
                isActive && 'font-semibold text-green-700'
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