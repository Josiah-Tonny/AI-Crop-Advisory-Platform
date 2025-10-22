import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: 'fade' | 'slide' | 'scale' | 'lift' | 'none';
  delay?: number;
  hover?: 'lift' | 'scale' | 'glow' | 'none';
  children: React.ReactNode;
}

/**
 * AnimatedCard Component
 * Extends the base Card component with smooth animations
 *
 * @param animation - Entry animation type
 * @param delay - Animation delay in milliseconds
 * @param hover - Hover effect type
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  animation = 'fade',
  delay = 0,
  hover = 'lift',
  className,
  children,
  ...props
}) => {
  const animationClasses = {
    fade: 'animate-fade-in',
    slide: 'animate-fade-in-up',
    scale: 'animate-scale-in',
    lift: 'animate-fade-in-up',
    none: ''
  };

  const hoverClasses = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'hover-glow',
    none: ''
  };

  return (
    <Card
      className={cn(
        animationClasses[animation],
        hoverClasses[hover],
        'transition-all duration-300',
        className
      )}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Card>
  );
};

/**
 * InteractiveCard Component
 * Card with click/tap feedback and optional actions
 */
interface InteractiveCardProps extends AnimatedCardProps {
  onClick?: () => void;
  onLongPress?: () => void;
  ripple?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  onClick,
  onLongPress,
  ripple = true,
  className,
  children,
  ...props
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [ripplePosition, setRipplePosition] = React.useState<{ x: number; y: number } | null>(null);
  const longPressTimer = React.useRef<NodeJS.Timeout>();

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);

    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      setRipplePosition({ x, y });

      setTimeout(() => setRipplePosition(null), 600);
    }

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <AnimatedCard
      className={cn(
        'cursor-pointer touch-target',
        isPressed && 'scale-95',
        'transition-transform duration-150',
        'active:scale-95',
        className
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {ripplePosition && (
        <span
          className="absolute pointer-events-none rounded-full bg-white/30 animate-ping"
          style={{
            left: ripplePosition.x,
            top: ripplePosition.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      {children}
    </AnimatedCard>
  );
};

/**
 * GlassCard Component
 * Card with glass morphism effect
 */
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg';
  opacity?: number;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  blur = 'md',
  opacity = 80,
  className,
  children,
  ...props
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 shadow-lg',
        blurClasses[blur],
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity / 100})`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * FeatureCard Component
 * Specialized card for showcasing features with icon
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  delay?: number;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  delay = 0,
  className
}) => {
  return (
    <AnimatedCard
      animation="slide"
      delay={delay}
      hover="lift"
      className={className}
    >
      <CardHeader>
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardFooter>
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            {action.label} →
          </button>
        </CardFooter>
      )}
    </AnimatedCard>
  );
};

/**
 * StatCard Component
 * Card for displaying statistics with smooth count-up animation
 */
interface StatCardProps {
  label: string;
  value: number | string;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  delay = 0,
  className
}) => {
  return (
    <AnimatedCard
      animation="scale"
      delay={delay}
      hover="glow"
      className={className}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <p className={cn(
                'text-xs font-medium flex items-center gap-1',
                change.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{change.trend === 'up' ? '↑' : '↓'}</span>
                <span>{Math.abs(change.value)}%</span>
              </p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

export default AnimatedCard;
