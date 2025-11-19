import React, { useEffect, useRef } from 'react';
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
  X,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Drawer Component with smooth animations and touch gestures
 * Slides in from left with backdrop blur effect
 */
const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

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

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Touch gesture handling for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;

    // Only allow swipe left to close (negative diff)
    if (diff < 0 && drawerRef.current) {
      const translateX = Math.max(diff, -300);
      drawerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    const diff = touchCurrentX.current - touchStartX.current;

    // If swiped more than 100px left, close the drawer
    if (diff < -100) {
      onClose();
    }

    // Reset transform
    if (drawerRef.current) {
      drawerRef.current.style.transform = '';
    }

    isDragging.current = false;
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-md lg:hidden",
          "animate-fade-in transition-all duration-300"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl lg:hidden",
          "animate-slide-in-left transition-all duration-300 transform",
          "safe-top safe-bottom"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex h-full flex-col overflow-y-auto scrollbar-thin">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/60 bg-white/95 backdrop-blur-xl px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AgriAI</h1>
                <p className="text-xs text-gray-500 font-medium">Smart Farming</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="touch-target hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all duration-300 group"
              aria-label="Close menu"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
              <X className="h-5 w-5 relative z-10" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            {/* Primary Navigation */}
            <div className="space-y-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 border-l-4 border-transparent',
                    'group flex items-center gap-x-3 rounded-r-xl px-4 py-3 text-sm font-medium',
                    'transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md touch-target',
                    'animate-fade-in-up',
                    `animation-delay-${index * 50}`
                  )}
                >
                  <div className="relative">
                    <item.icon
                      className={cn(
                        location.pathname === item.href
                          ? 'text-green-600'
                          : 'text-gray-400 group-hover:text-green-600',
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
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Secondary Navigation */}
            <div className="space-y-1">
              {secondaryNavigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-900 border-l-4 border-gray-400'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-900 border-l-4 border-transparent',
                    'group flex items-center gap-x-3 rounded-r-xl px-4 py-3 text-sm font-medium',
                    'transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md touch-target',
                    'animate-fade-in-up',
                    `animation-delay-${(index + 10) * 50}`
                  )}
                >
                  <item.icon
                    className={cn(
                      location.pathname === item.href
                        ? 'text-gray-600'
                        : 'text-gray-400 group-hover:text-gray-600',
                      'h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110'
                    )}
                    aria-hidden="true"
                  />
                  <span className="relative">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer hint */}
          <div className="border-t border-gray-200/60 p-4 bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              <p className="text-xs text-center text-gray-600 font-medium">
                Swipe left to close
              </p>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
