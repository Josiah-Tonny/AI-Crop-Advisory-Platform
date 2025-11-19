import { useCallback, useEffect, useRef } from 'react';

interface SmoothScrollOptions {
  duration?: number;
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}

/**
 * useSmoothScroll Hook
 * Provides smooth scrolling functionality with custom easing
 *
 * @param options - Configuration for scroll behavior
 * @returns Object with scroll functions
 */
export const useSmoothScroll = (options: SmoothScrollOptions = {}) => {
  const { duration = 500, easing = 'easeInOut' } = options;

  const easingFunctions = {
    linear: (t: number) => t,
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t)
  };

  const scrollTo = useCallback((target: number | HTMLElement, container?: HTMLElement) => {
    const element = container || window;
    const isWindow = element === window;

    const start = isWindow
      ? window.pageYOffset
      : (element as HTMLElement).scrollTop;

    const targetPosition = typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + start;

    const distance = targetPosition - start;
    const startTime = performance.now();

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easingFunctions[easing](progress);
      const position = start + distance * ease;

      if (isWindow) {
        window.scrollTo(0, position);
      } else {
        (element as HTMLElement).scrollTop = position;
      }

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }, [duration, easing]);

  const scrollToTop = useCallback((container?: HTMLElement) => {
    scrollTo(0, container);
  }, [scrollTo]);

  const scrollToBottom = useCallback((container?: HTMLElement) => {
    const element = container || document.documentElement;
    scrollTo(element.scrollHeight, container);
  }, [scrollTo]);

  const scrollToElement = useCallback((
    selector: string,
    offset: number = 0,
    container?: HTMLElement
  ) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      const targetPosition = element.offsetTop - offset;
      scrollTo(targetPosition, container);
    }
  }, [scrollTo]);

  return {
    scrollTo,
    scrollToTop,
    scrollToBottom,
    scrollToElement
  };
};

/**
 * useScrollPosition Hook
 * Tracks scroll position with optional throttling
 *
 * @param throttle - Throttle delay in milliseconds
 * @returns Current scroll position
 */
export const useScrollPosition = (throttle: number = 100) => {
  const [scrollPosition, setScrollPosition] = React.useState({
    x: 0,
    y: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setScrollPosition({
          x: window.pageXOffset,
          y: window.pageYOffset
        });
      }, throttle);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [throttle]);

  return scrollPosition;
};

/**
 * useScrollDirection Hook
 * Detects scroll direction (up or down)
 */
import React from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = React.useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
};

/**
 * useInfiniteScroll Hook
 * Detects when user scrolls near bottom of page for infinite scroll
 *
 * @param callback - Function to call when threshold is reached
 * @param threshold - Distance from bottom in pixels to trigger callback
 */
export const useInfiniteScroll = (
  callback: () => void,
  threshold: number = 200
) => {
  const [isFetching, setIsFetching] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isFetching) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setIsFetching(true);
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, threshold, isFetching]);

  return [isFetching, setIsFetching] as const;
};

/**
 * useScrollToTopButton Hook
 * Shows/hides scroll to top button based on scroll position
 */
export const useScrollToTopButton = (showAfter: number = 300) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > showAfter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return { isVisible, scrollToTop };
};

export default useSmoothScroll;
