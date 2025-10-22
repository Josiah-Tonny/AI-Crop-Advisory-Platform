import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

/**
 * PullToRefresh Component
 * Provides native-like pull-to-refresh functionality for mobile devices
 *
 * @param onRefresh - Async function to call when refresh is triggered
 * @param threshold - Distance in pixels to trigger refresh (default: 80)
 * @param disabled - Disable pull-to-refresh functionality
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  // Check if we're at the top of the scroll container
  const checkCanPull = useCallback(() => {
    if (containerRef.current) {
      const isAtTop = containerRef.current.scrollTop === 0;
      setCanPull(isAtTop);
      return isAtTop;
    }
    return false;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    if (checkCanPull()) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [disabled, isRefreshing, checkCanPull]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return;

    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;

    // Only allow pull down (positive diff)
    if (diff > 0 && checkCanPull()) {
      // Prevent default scroll behavior
      e.preventDefault();

      // Apply resistance to pull distance (diminishing returns)
      const resistance = 0.4;
      const distance = Math.pow(diff, resistance) * 2;
      setPullDistance(Math.min(distance, threshold * 1.5));

      // Update content transform
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${Math.min(distance, threshold * 1.5)}px)`;
      }
    }
  }, [disabled, isRefreshing, canPull, threshold, checkCanPull]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    const shouldRefresh = pullDistance >= threshold;

    if (shouldRefresh && onRefresh) {
      setIsRefreshing(true);

      // Snap to threshold position
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.2s ease';
        contentRef.current.style.transform = `translateY(${threshold}px)`;
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.3s ease';
        contentRef.current.style.transform = 'translateY(0)';
      }
      setPullDistance(0);

      // Clean up transition after animation
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = '';
        }
      }, 300);
    }, shouldRefresh ? 500 : 0);
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  // Setup touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('scroll', checkCanPull);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', checkCanPull);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, checkCanPull]);

  // Calculate refresh indicator state
  const getIndicatorState = () => {
    if (isRefreshing) return 'refreshing';
    if (pullDistance >= threshold) return 'ready';
    if (pullDistance > 0) return 'pulling';
    return 'idle';
  };

  const indicatorState = getIndicatorState();
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = isRefreshing ? 0 : (pullDistance / threshold) * 360;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-y-auto h-full scroll-smooth',
        className
      )}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center',
          'pointer-events-none z-10',
          'transition-opacity duration-200'
        )}
        style={{
          height: `${threshold}px`,
          opacity: indicatorOpacity,
          transform: `translateY(${Math.min(pullDistance - threshold, 0)}px)`
        }}
      >
        <div className={cn(
          'flex flex-col items-center gap-2 py-2',
          'transition-all duration-200'
        )}>
          <div className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-full',
            'bg-white shadow-md',
            'transition-all duration-200',
            indicatorState === 'ready' && 'scale-110 bg-green-50',
            isRefreshing && 'animate-pulse'
          )}>
            <RefreshCw
              className={cn(
                'w-5 h-5 transition-all duration-200',
                indicatorState === 'ready' && 'text-green-600',
                isRefreshing ? 'animate-spin text-green-600' : 'text-gray-600'
              )}
              style={{
                transform: isRefreshing ? '' : `rotate(${indicatorRotation}deg)`
              }}
            />
          </div>
          <p className={cn(
            'text-xs font-medium transition-colors duration-200',
            indicatorState === 'ready' && 'text-green-600',
            isRefreshing ? 'text-green-600' : 'text-gray-600'
          )}>
            {isRefreshing
              ? 'Refreshing...'
              : indicatorState === 'ready'
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
