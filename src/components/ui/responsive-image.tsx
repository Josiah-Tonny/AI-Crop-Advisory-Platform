import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' | number;
  blur?: boolean;
  skeleton?: boolean;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage Component
 * Provides lazy loading, aspect ratio preservation, blur-up effect, and error handling
 *
 * @param aspectRatio - Predefined or custom aspect ratio (square: 1, video: 16/9, wide: 21/9, portrait: 3/4)
 * @param blur - Enable blur-up loading effect
 * @param skeleton - Show skeleton while loading
 * @param fallbackSrc - Image to show if main image fails to load
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio,
  blur = true,
  skeleton = true,
  fallbackSrc,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Define aspect ratio presets
  const aspectRatioMap = {
    square: 100,
    video: (9 / 16) * 100,
    wide: (9 / 21) * 100,
    portrait: (4 / 3) * 100
  };

  const paddingBottom = aspectRatio
    ? typeof aspectRatio === 'number'
      ? `${(1 / aspectRatio) * 100}%`
      : `${aspectRatioMap[aspectRatio]}%`
    : undefined;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image is in view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatio && 'aspect-ratio-box',
        containerClassName
      )}
      style={aspectRatio ? { paddingBottom } : undefined}
    >
      {/* Skeleton loader */}
      {skeleton && isLoading && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            blur && isLoading && 'blur-lg scale-110',
            !isLoading && 'blur-0 scale-100',
            aspectRatio && 'absolute inset-0',
            className
          )}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ProgressiveImage Component
 * Shows low-quality placeholder that transitions to high-quality image
 */
interface ProgressiveImageProps extends Omit<ResponsiveImageProps, 'blur'> {
  placeholderSrc: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholderSrc,
  alt,
  className,
  containerClassName,
  aspectRatio,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <ResponsiveImage
      src={currentSrc}
      alt={alt}
      aspectRatio={aspectRatio}
      blur={!isLoaded}
      className={cn(
        'transition-all duration-700',
        !isLoaded && 'blur-md',
        className
      )}
      containerClassName={containerClassName}
      {...props}
    />
  );
};

/**
 * ImageGallery Component
 * Grid of responsive images with lazy loading
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: ResponsiveImageProps['aspectRatio'];
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
  onImageClick
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'group cursor-pointer',
            onImageClick && 'hover-lift'
          )}
          onClick={() => onImageClick?.(index)}
        >
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspectRatio={aspectRatio}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          {image.caption && (
            <p className="mt-2 text-sm text-muted-foreground">{image.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Avatar Component
 * Optimized circular image for user avatars
 */
interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : fallback ? (
        <span className="font-semibold text-muted-foreground">
          {fallback}
        </span>
      ) : (
        <span className="font-semibold text-muted-foreground">
          {initials}
        </span>
      )}
    </div>
  );
};

export default ResponsiveImage;
