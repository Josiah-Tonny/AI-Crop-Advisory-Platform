import React, { useState } from 'react';
import { Menu, Bell, Search, User, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
      "border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm",
      "px-4 sm:gap-x-6 sm:px-6 lg:px-8",
      "transition-all duration-200"
    )}>
      {/* Menu button for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "lg:hidden touch-target transition-all duration-200",
          "hover:bg-green-50 hover:scale-105"
        )}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

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
                "block w-full rounded-lg border-0 bg-gray-50 py-2 pl-10 pr-3",
                "text-gray-900 placeholder:text-gray-400",
                "focus:bg-white focus:ring-2 focus:ring-green-600",
                "transition-all duration-200",
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
                    "block w-full rounded-lg border-0 bg-gray-50 py-2 pl-10 pr-10",
                    "text-gray-900 placeholder:text-gray-400",
                    "focus:bg-white focus:ring-2 focus:ring-green-600",
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
              "relative touch-target transition-all duration-200",
              "hover:bg-green-50 hover:scale-105"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
            <span className={cn(
              "absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full",
              "text-xs text-white flex items-center justify-center font-medium",
              "animate-pulse shadow-lg"
            )}>
              3
            </span>
          </Button>

          {/* Separator - desktop only */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* User info and actions */}
          <div className="flex items-center gap-x-2">
            {/* User name - hidden on small screens */}
            <span className="hidden md:block text-sm text-gray-700 font-medium transition-colors">
              {user?.firstName} {user?.lastName}
            </span>

            {/* Profile button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "touch-target transition-all duration-200",
                "hover:bg-green-50 hover:scale-105"
              )}
              title="Profile"
              aria-label="View profile"
            >
              <User className="h-6 w-6" />
            </Button>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className={cn(
                "touch-target transition-all duration-200",
                "hover:bg-red-50 hover:text-red-600 hover:scale-105"
              )}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;