import { useRef, useCallback, TouchEvent } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeGestureOptions {
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

/**
 * useSwipeGesture Hook
 * Detects swipe gestures on touch devices
 *
 * @param options - Configuration object for swipe detection
 * @returns Touch event handlers to attach to element
 *
 * @example
 * const swipeHandlers = useSwipeGesture({
 *   onSwipeLeft: () => console.log('Swiped left'),
 *   onSwipeRight: () => console.log('Swiped right'),
 *   threshold: 50
 * });
 *
 * return <div {...swipeHandlers}>Swipe me!</div>
 */
export const useSwipeGesture = (options: SwipeGestureOptions = {}) => {
  const {
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false
  } = options;

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  }, [preventDefaultTouchmoveEvent]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStart.current.x;
    const deltaY = touchEnd.y - touchStart.current.y;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if swipe is horizontal or vertical
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      touchStart.current = null;
      return;
    }

    let direction: SwipeDirection;

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
    }

    // Call appropriate handlers
    onSwipe?.(direction);

    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }

    touchStart.current = null;
  }, [onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

/**
 * useLongPress Hook
 * Detects long press gestures
 *
 * @param callback - Function to call on long press
 * @param options - Configuration options
 * @returns Event handlers to attach to element
 */
interface LongPressOptions {
  delay?: number;
  shouldPreventDefault?: boolean;
}

export const useLongPress = (
  callback: () => void,
  options: LongPressOptions = {}
) => {
  const { delay = 500, shouldPreventDefault = true } = options;

  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: TouchEvent | MouseEvent) => {
    if (shouldPreventDefault && 'touches' in event) {
      event.preventDefault();
    }

    target.current = event.target as EventTarget;

    timeout.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay, shouldPreventDefault]);

  const clear = useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
  }, []);

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear
  };
};

export default useSwipeGesture;
