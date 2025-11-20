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
  CreditCard,
  TrendingUp,
  Leaf,
  Sun,
  Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../ui/Logo';

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
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl border-r border-gray-200/60 px-6 pb-4 shadow-lg">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-2">
          <Logo variant="full" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-r-2 border-green-600 shadow-sm'
                          : 'text-gray-700 hover:text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50',
                        'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md',
                        'animate-fade-in-up',
                        `animation-delay-${index * 50}`
                      )}
                    >
                      <div className="relative">
                        <item.icon
                          className={cn(
                            location.pathname === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600',
                            'h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110'
                          )}
                          aria-hidden="true"
                        />
                        {location.pathname === item.href && (
                          <div className="absolute inset-0 bg-green-600 rounded-full blur-md opacity-30 animate-pulse"></div>
                        )}
                      </div>
                      <span className="relative">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item, index) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-r-2 border-gray-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50',
                        'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md',
                        'animate-fade-in-up',
                        `animation-delay-${(index + 10) * 50}`
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600',
                          'h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110'
                        )}
                        aria-hidden="true"
                      />
                      <span className="relative">{item.name}</span>
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