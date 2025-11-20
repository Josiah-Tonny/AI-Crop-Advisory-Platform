import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'icon' | 'full';
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  textSize = 'md',
  variant = 'default',
}) => {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const renderLogo = () => (
    <div className={cn("flex items-center space-x-2 group", className)}>
      {/* Logo Container */}
      <div className="relative">
        {/* Animated background gradient */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-all duration-300 group-hover:duration-1000"></div>
        
        {/* Logo */}
        <div className={cn(
          "relative flex items-center justify-center rounded-lg bg-white border-2 border-emerald-100 shadow-sm",
          "group-hover:shadow-md transition-all duration-300",
          variant === 'icon' ? 'h-10 w-10 p-2' : 'h-12 w-12 p-2.5'
        )}>
          <img 
            src="/images/FARM AI.jpeg" 
            alt="FARM AI Logo" 
            className={cn(
              "h-full w-full object-contain transition-transform duration-300",
              "group-hover:scale-110"
            )}
          />
        </div>
      </div>

      {/* Text - Only show if not icon variant */}
      {variant !== 'icon' && showText && (
        <div className="transform transition-all duration-300 group-hover:translate-x-1">
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent",
            textSizes[textSize],
            variant === 'full' ? 'text-xl' : ''
          )}>
            FARM AI
          </h1>
          {variant === 'full' && (
            <p className="text-xs text-gray-500 font-medium">Smart Farming Platform</p>
          )}
        </div>
      )}
    </div>
  );

  // Wrap in Link if not icon variant
  return variant === 'icon' ? (
    renderLogo()
  ) : (
    <Link to="/dashboard" className="block">
      {renderLogo()}
    </Link>
  );
};

export default Logo;
