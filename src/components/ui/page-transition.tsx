import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition Component
 * Provides smooth fade-in-up animation when navigating between pages
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset animation on route change
    setIsVisible(false);

    // Trigger animation after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * PageTransitionSlide Component
 * Provides slide-in animation from right
 */
export const PageTransitionSlide: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * PageTransitionScale Component
 * Provides scale-in animation
 */
export const PageTransitionScale: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'transition-all duration-300 transform-gpu',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * StaggeredTransition Component
 * Animates children with staggered delays
 */
interface StaggeredTransitionProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const StaggeredTransition: React.FC<StaggeredTransitionProps> = ({
  children,
  delay = 100,
  className
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{
            transitionDelay: isVisible ? `${index * delay}ms` : '0ms'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default PageTransition;
