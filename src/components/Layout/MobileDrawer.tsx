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
  X
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
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden",
          "animate-fade-in"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl lg:hidden",
          "animate-slide-in-left transition-transform",
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
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AgriAI</h1>
                <p className="text-xs text-gray-500">Smart Farming</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="touch-target"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
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
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700 border-l-4 border-transparent',
                    'group flex items-center gap-x-3 rounded-r-md px-4 py-3 text-sm font-medium',
                    'transition-all duration-200 touch-target',
                    'animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <item.icon
                    className={cn(
                      location.pathname === item.href
                        ? 'text-green-600'
                        : 'text-gray-400 group-hover:text-green-600',
                      'h-5 w-5 shrink-0 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
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
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center gap-x-3 rounded-md px-4 py-3 text-sm font-medium',
                    'transition-all duration-200 touch-target',
                    'animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${(navigation.length + index) * 30}ms` }}
                >
                  <item.icon
                    className={cn(
                      location.pathname === item.href
                        ? 'text-gray-600'
                        : 'text-gray-400 group-hover:text-gray-600',
                      'h-5 w-5 shrink-0 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer hint */}
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-center text-gray-500">
              Swipe left to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
