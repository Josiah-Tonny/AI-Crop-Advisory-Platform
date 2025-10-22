import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  className?: string;
}

/**
 * LoadingOverlay Component
 * Provides a smooth loading overlay with spinner and optional message
 *
 * @param isLoading - Controls visibility of the overlay
 * @param message - Optional loading message to display
 * @param fullScreen - If true, overlay covers entire viewport
 * @param transparent - If true, uses transparent background instead of blur
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  fullScreen = false,
  transparent = false,
  className
}) => {
  if (!isLoading) return null;

  const overlayContent = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      'p-8 rounded-lg',
      transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm shadow-lg'
    )}>
      <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      {message && (
        <p className="text-sm font-medium text-gray-700 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-black/20 backdrop-blur-sm',
          'animate-fade-in',
          className
        )}
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {overlayContent}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center',
        'bg-white/80 backdrop-blur-sm',
        'animate-fade-in',
        className
      )}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      {overlayContent}
    </div>
  );
};

/**
 * LoadingSpinner Component
 * Simple inline spinner without overlay
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-green-600',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  );
};

/**
 * LoadingDots Component
 * Three-dot loading animation
 */
interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  return (
    <div className={cn('flex items-center gap-1', className)} aria-label="Loading">
      <div className={cn('rounded-full bg-green-600 animate-bounce', sizeClasses[size])} />
      <div
        className={cn('rounded-full bg-green-600 animate-bounce', sizeClasses[size])}
        style={{ animationDelay: '0.1s' }}
      />
      <div
        className={cn('rounded-full bg-green-600 animate-bounce', sizeClasses[size])}
        style={{ animationDelay: '0.2s' }}
      />
    </div>
  );
};

/**
 * LoadingBar Component
 * Progress bar loading indicator
 */
interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress = 0,
  indeterminate = false,
  className
}) => {
  return (
    <div
      className={cn(
        'relative h-1 w-full bg-gray-200 rounded-full overflow-hidden',
        className
      )}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {indeterminate ? (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-600 to-transparent animate-shimmer" />
      ) : (
        <div
          className="h-full bg-green-600 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      )}
    </div>
  );
};

/**
 * LoadingButton Component
 * Button with integrated loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'px-4 py-2 rounded-md',
        'bg-green-600 text-white font-medium',
        'hover:bg-green-700 active:bg-green-800',
        'transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'touch-target',
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      <span className={cn(isLoading && 'opacity-70')}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};

/**
 * FullPageLoader Component
 * Centered full-page loader with brand elements
 */
interface FullPageLoaderProps {
  message?: string;
  logo?: React.ReactNode;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Loading your agricultural insights...',
  logo
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center space-y-6 animate-fade-in">
        {logo && (
          <div className="flex justify-center animate-bounce">
            {logo}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
          </div>

          <p className="text-lg font-medium text-gray-700">
            {message}
          </p>

          <LoadingDots size="md" className="justify-center" />
        </div>
      </div>
    </div>
  );
};

/**
 * InlineLoader Component
 * Small inline loader for buttons or cards
 */
interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  text,
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-green-600', sizeClasses[size])} />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

export default LoadingOverlay;
