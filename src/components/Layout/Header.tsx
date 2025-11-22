import React, { useState } from 'react';
import { Menu, Bell, Search, User, LogOut, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from '../ui/Logo';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchValue('');
    }
  };

  return (
    <div className={cn(
      "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4",
      "border-b border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-sm",
      "px-4 sm:gap-x-6 sm:px-6 lg:px-8",
      "transition-all duration-300"
    )}>
      <div className="flex items-center lg:hidden space-x-2">
        {/* Menu button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "touch-target transition-all duration-300",
            "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-105 hover:shadow-md",
            "relative overflow-hidden group"
          )}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <Menu className="h-6 w-6 relative z-10" />
        </Button>

        {/* Mobile Logo */}
        <div className="ml-2">
          <Logo variant="default" textSize="sm" />
        </div>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search - Desktop always visible, Mobile expandable */}
        <div className={cn(
          "relative flex items-center transition-all duration-300",
          isSearchExpanded ? 'flex-1' : 'flex-1 lg:flex-1'
        )}>
          {/* Desktop search */}
          <div className="hidden sm:flex relative flex-1 items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className={cn(
                "block w-full rounded-xl border-0 bg-gradient-to-r from-gray-50 to-slate-50 py-2.5 pl-10 pr-3",
                "text-gray-900 placeholder:text-gray-400",
                "focus:bg-white focus:ring-2 focus:ring-green-600 focus:shadow-lg",
                "transition-all duration-300 transform focus:scale-[1.01]",
                "sm:text-sm sm:leading-6"
              )}
              placeholder="Search crops, weather, or ask AI..."
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Mobile search - expandable */}
          <div className={cn(
            "sm:hidden flex items-center transition-all duration-300",
            isSearchExpanded ? 'w-full' : 'w-auto'
          )}>
            {!isSearchExpanded ? (
              <Button
                variant="ghost"
                size="icon"
                className="touch-target hover:bg-green-50"
                onClick={toggleSearch}
                aria-label="Expand search"
              >
                <Search className="h-5 w-5" />
              </Button>
            ) : (
              <div className="relative flex-1 flex items-center animate-fade-in">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className={cn(
                    "block w-full rounded-xl border-0 bg-gradient-to-r from-gray-50 to-slate-50 py-2.5 pl-10 pr-10",
                    "text-gray-900 placeholder:text-gray-400",
                    "focus:bg-white focus:ring-2 focus:ring-green-600 focus:shadow-lg",
                    "text-sm"
                  )}
                  placeholder="Search..."
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={toggleSearch}
                  className="absolute right-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side actions - hide when mobile search is expanded */}
        <div className={cn(
          "flex items-center gap-x-2 lg:gap-x-4 transition-all duration-300",
          isSearchExpanded && 'sm:flex hidden'
        )}>
          {/* Notification bell with animated badge */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative touch-target transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-105 hover:shadow-md",
              "group overflow-hidden"
            )}
            aria-label="Notifications"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <Bell className="h-6 w-6 relative z-10" />
            <span className={cn(
              "absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full",
              "text-xs text-white flex items-center justify-center font-medium",
              "animate-pulse shadow-lg border-2 border-white",
              "group-hover:scale-110 transition-transform duration-300"
            )}>
              3
            </span>
          </Button>

          {/* Separator - desktop only */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* User info and actions */}
          <div className="flex items-center gap-x-2">
            {user ? (
              <>
                {/* User name - hidden on small screens */}
                <div className="hidden md:block">
                  <span className="text-sm text-gray-700 font-medium transition-colors bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                    <span className="text-xs text-gray-500 font-medium">Premium User</span>
                  </div>
                </div>

                {/* Profile button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "touch-target transition-all duration-300",
                    "hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-105 hover:shadow-md",
                    "group overflow-hidden relative"
                  )}
                  title="Profile"
                  aria-label="View profile"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <User className="h-6 w-6 relative z-10" />
                </Button>

                {/* Logout button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className={cn(
                    "touch-target transition-all duration-300",
                    "hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 hover:scale-105 hover:shadow-md",
                    "group overflow-hidden relative"
                  )}
                  title="Logout"
                  aria-label="Logout"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <LogOut className="h-6 w-6 relative z-10" />
                </Button>
              </>
            ) : (
              /* Login button for unauthenticated users */
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className={cn(
                  "touch-target transition-all duration-300",
                  "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-md",
                  "group overflow-hidden relative"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative z-10 font-medium">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;