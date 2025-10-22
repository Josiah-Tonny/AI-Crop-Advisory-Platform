# UI/UX Enhancements Documentation

## Overview

Comprehensive UI/UX improvements have been implemented to provide a smooth, modern, and responsive experience across both web and mobile platforms. The enhancements focus on:

- Smooth animations and transitions
- Mobile-first responsive design
- Touch-friendly interactions
- Performance optimization
- Accessibility improvements

---

## Table of Contents

1. [Global Styles & Design System](#global-styles--design-system)
2. [Loading Components](#loading-components)
3. [Navigation Enhancements](#navigation-enhancements)
4. [Image Components](#image-components)
5. [Animation Components](#animation-components)
6. [Custom Hooks](#custom-hooks)
7. [Usage Examples](#usage-examples)

---

## Global Styles & Design System

### Location: `src/index.css`

The foundation CSS file has been completely rewritten with a comprehensive design system.

### Features Added:

#### 1. **CSS Variables**
```css
:root {
  /* Spacing */
  --header-height: 4rem;
  --sidebar-width: 16rem;
  --mobile-nav-height: 4rem;

  /* Transitions */
  --transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### 2. **Animation Keyframes**
11 smooth animations:
- `fadeIn`, `fadeOut`
- `fadeInUp`, `fadeInDown`
- `slideInLeft`, `slideInRight`
- `scaleIn`
- `shimmer` (for skeleton loaders)
- `pulse`, `spin`, `bounce`

#### 3. **Utility Classes**
```css
.animate-fade-in-up      /* Fade in with upward motion */
.animate-slide-in-left   /* Slide from left */
.animate-shimmer         /* Shimmer loading effect */
.hover-lift              /* Lift on hover */
.hover-scale             /* Scale up on hover */
.hover-glow              /* Glow shadow on hover */
```

#### 4. **Mobile-First Features**
```css
.touch-target            /* Minimum 44px touch targets */
.safe-top                /* Safe area for notched devices */
.scroll-smooth           /* Smooth scroll with touch support */
.scrollbar-thin          /* Custom thin scrollbar */
```

#### 5. **Accessibility**
- Reduced motion support for users with motion sensitivities
- Screen reader only content utilities
- Enhanced focus indicators

---

## Loading Components

### 1. Skeleton Loaders
**Location:** `src/components/ui/skeleton.tsx`

#### Components:
- `<Skeleton>` - Base skeleton with pulse/shimmer animation
- `<SkeletonText>` - Multi-line text placeholder
- `<SkeletonCard>` - Complete card skeleton
- `<SkeletonAvatar>` - Circular avatar placeholder
- `<SkeletonTable>` - Table data skeleton
- `<SkeletonList>` - List with optional avatars
- `<SkeletonChart>` - Chart placeholder
- `<SkeletonForm>` - Form fields skeleton

#### Example:
```tsx
import { SkeletonCard } from '@/components/ui/skeleton';

<SkeletonCard shimmer={true} />
```

### 2. Loading Overlays
**Location:** `src/components/ui/loading-overlay.tsx`

#### Components:
- `<LoadingOverlay>` - Full or partial overlay with spinner
- `<LoadingSpinner>` - Inline spinner (sm/md/lg)
- `<LoadingDots>` - Three-dot animation
- `<LoadingBar>` - Progress bar with indeterminate mode
- `<LoadingButton>` - Button with integrated loading state
- `<FullPageLoader>` - Branded full-page loader
- `<InlineLoader>` - Small inline loader for buttons/cards

#### Example:
```tsx
import { LoadingOverlay, LoadingButton } from '@/components/ui/loading-overlay';

<LoadingOverlay isLoading={isLoading} message="Fetching data..." />

<LoadingButton
  isLoading={isSubmitting}
  loadingText="Saving..."
>
  Save Changes
</LoadingButton>
```

### 3. Enhanced Toast Notifications
**Location:** `src/components/ui/toast.tsx`

#### New Features:
- 4 new variants: `success`, `warning`, `error`, `info`
- Automatic icon display
- Backdrop blur effect
- Improved mobile animations
- Safe area support for notched devices

#### Example:
```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  variant: "success",
  title: "Success!",
  description: "Your data has been saved."
});
```

---

## Navigation Enhancements

### 1. Mobile Drawer
**Location:** `src/components/Layout/MobileDrawer.tsx`

#### Features:
- Slide-in animation from left
- Swipe-to-close gesture support
- Backdrop blur effect
- Staggered menu item animations
- Auto-close on route change
- ESC key support
- Safe area insets

#### Touch Gestures:
- Swipe left to close
- Tap backdrop to close
- ESC key to close

### 2. Enhanced Mobile Bottom Navigation
**Location:** `src/components/Layout/MobileNav.tsx`

#### Features:
- Active indicator with animated bar
- Icon scale animation on active state
- Pulse effect on active item
- Smooth color transitions
- Touch-optimized targets
- Safe area support

### 3. Enhanced Header
**Location:** `src/components/Layout/Header.tsx`

#### New Features:
- Expandable mobile search with smooth animation
- Animated notification badge with pulse effect
- Hover scale effects on buttons
- Backdrop blur for modern look
- Touch-optimized buttons
- Responsive user info display

---

## Image Components

**Location:** `src/components/ui/responsive-image.tsx`

### Components:

#### 1. **ResponsiveImage**
Lazy loading image with aspect ratio support and blur-up effect.

```tsx
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  aspectRatio="video"  // or 'square', 'wide', 'portrait', or custom number
  blur={true}
  skeleton={true}
  fallbackSrc="/fallback.jpg"
/>
```

#### 2. **ProgressiveImage**
Low-quality placeholder that transitions to high-quality.

```tsx
<ProgressiveImage
  placeholderSrc="/image-low.jpg"
  src="/image-high.jpg"
  alt="Description"
/>
```

#### 3. **ImageGallery**
Grid of lazy-loaded images with hover effects.

```tsx
<ImageGallery
  images={[
    { src: '/1.jpg', alt: 'Image 1', caption: 'Caption' },
    { src: '/2.jpg', alt: 'Image 2' }
  ]}
  columns={3}
  gap="md"
  aspectRatio="square"
  onImageClick={(index) => console.log(index)}
/>
```

#### 4. **Avatar**
Optimized circular image with fallback initials.

```tsx
<Avatar
  src="/user.jpg"
  alt="John Doe"
  size="lg"  // xs, sm, md, lg, xl, 2xl
/>
```

---

## Animation Components

### 1. Page Transitions
**Location:** `src/components/ui/page-transition.tsx`

#### Components:
- `<PageTransition>` - Fade in up animation
- `<PageTransitionSlide>` - Slide from right
- `<PageTransitionScale>` - Scale in effect
- `<StaggeredTransition>` - Children animate with delays

#### Example:
```tsx
import { PageTransition } from '@/components/ui/page-transition';

function MyPage() {
  return (
    <PageTransition>
      <h1>Page Content</h1>
    </PageTransition>
  );
}
```

### 2. Pull to Refresh
**Location:** `src/components/ui/pull-to-refresh.tsx`

Native-like pull-to-refresh for mobile devices.

#### Example:
```tsx
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

<PullToRefresh
  onRefresh={async () => {
    await fetchFreshData();
  }}
  threshold={80}
>
  <YourContent />
</PullToRefresh>
```

### 3. Animated Cards
**Location:** `src/components/ui/animated-card.tsx`

#### Components:

##### **AnimatedCard**
```tsx
<AnimatedCard
  animation="slide"  // fade, slide, scale, lift, none
  delay={100}
  hover="lift"  // lift, scale, glow, none
>
  <CardContent>Content</CardContent>
</AnimatedCard>
```

##### **InteractiveCard**
With click/tap feedback and ripple effect.
```tsx
<InteractiveCard
  onClick={() => console.log('clicked')}
  onLongPress={() => console.log('long pressed')}
  ripple={true}
>
  <CardContent>Tap me!</CardContent>
</InteractiveCard>
```

##### **GlassCard**
Glass morphism effect.
```tsx
<GlassCard blur="md" opacity={80}>
  <div className="p-6">Glassmorphic content</div>
</GlassCard>
```

##### **FeatureCard**
For showcasing features with icons.
```tsx
<FeatureCard
  icon={<Icon />}
  title="Feature Title"
  description="Feature description"
  action={{
    label: "Learn more",
    onClick: () => navigate('/feature')
  }}
  delay={100}
/>
```

##### **StatCard**
For displaying statistics.
```tsx
<StatCard
  label="Total Users"
  value="1,234"
  change={{ value: 12.5, trend: 'up' }}
  icon={<UsersIcon />}
  delay={0}
/>
```

---

## Custom Hooks

### 1. Touch Gesture Hooks
**Location:** `src/hooks/useSwipeGesture.ts`

#### useSwipeGesture
Detects swipe gestures on touch devices.

```tsx
import { useSwipeGesture } from '@/hooks';

const swipeHandlers = useSwipeGesture({
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
  threshold: 50
});

return <div {...swipeHandlers}>Swipe me!</div>;
```

#### useLongPress
Detects long press gestures.

```tsx
import { useLongPress } from '@/hooks';

const longPressHandlers = useLongPress(
  () => console.log('Long pressed!'),
  { delay: 500 }
);

return <button {...longPressHandlers}>Long press me</button>;
```

### 2. Smooth Scroll Hooks
**Location:** `src/hooks/useSmoothScroll.ts`

#### useSmoothScroll
```tsx
import { useSmoothScroll } from '@/hooks';

const { scrollTo, scrollToTop, scrollToElement } = useSmoothScroll({
  duration: 500,
  easing: 'easeInOut'
});

<button onClick={scrollToTop}>Back to top</button>
<button onClick={() => scrollToElement('#section')}>Go to section</button>
```

#### useScrollPosition
Tracks current scroll position.
```tsx
import { useScrollPosition } from '@/hooks';

const { x, y } = useScrollPosition(100); // throttle 100ms
```

#### useScrollDirection
Detects scroll direction.
```tsx
import { useScrollDirection } from '@/hooks';

const direction = useScrollDirection(); // 'up' | 'down' | null
```

#### useInfiniteScroll
For infinite scroll pagination.
```tsx
import { useInfiniteScroll } from '@/hooks';

const [isFetching, setIsFetching] = useInfiniteScroll(
  async () => {
    await loadMoreData();
    setIsFetching(false);
  },
  200 // threshold in pixels
);
```

#### useScrollToTopButton
Shows/hides scroll to top button.
```tsx
import { useScrollToTopButton } from '@/hooks';

const { isVisible, scrollToTop } = useScrollToTopButton(300);

{isVisible && (
  <button onClick={scrollToTop}>
    Back to Top
  </button>
)}
```

---

## Usage Examples

### Example 1: Smooth Page with Loading State

```tsx
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { AnimatedCard } from '@/components/ui/animated-card';

function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then(() => setIsLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="relative">
        <LoadingOverlay isLoading={isLoading} message="Loading dashboard..." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard animation="slide" delay={0} hover="lift">
            <CardContent>Card 1</CardContent>
          </AnimatedCard>
          <AnimatedCard animation="slide" delay={100} hover="lift">
            <CardContent>Card 2</CardContent>
          </AnimatedCard>
          <AnimatedCard animation="slide" delay={200} hover="lift">
            <CardContent>Card 3</CardContent>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
```

### Example 2: Mobile-Optimized List with Pull-to-Refresh

```tsx
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SkeletonList } from '@/components/ui/skeleton';
import { ResponsiveImage } from '@/components/ui/responsive-image';

function FarmsList() {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = async () => {
    await fetchFarms();
  };

  if (isLoading) {
    return <SkeletonList items={5} withAvatar shimmer />;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4">
        {farms.map((farm) => (
          <InteractiveCard key={farm.id} onClick={() => navigate(`/farm/${farm.id}`)}>
            <div className="flex gap-4 p-4">
              <ResponsiveImage
                src={farm.image}
                alt={farm.name}
                aspectRatio="square"
                className="w-20 h-20 rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{farm.name}</h3>
                <p className="text-sm text-muted-foreground">{farm.location}</p>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </PullToRefresh>
  );
}
```

### Example 3: Interactive Gallery with Gestures

```tsx
import { ImageGallery } from '@/components/ui/responsive-image';
import { useSwipeGesture } from '@/hooks';

function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [...]; // your images

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => setCurrentIndex(prev => Math.min(prev + 1, images.length - 1)),
    onSwipeRight: () => setCurrentIndex(prev => Math.max(prev - 1, 0)),
    threshold: 50
  });

  return (
    <div {...swipeHandlers}>
      <ImageGallery
        images={images}
        columns={3}
        gap="md"
        aspectRatio="square"
        onImageClick={(index) => setCurrentIndex(index)}
      />
    </div>
  );
}
```

---

## Performance Optimizations

### 1. GPU Acceleration
All animations use `transform` and `opacity` for GPU acceleration:
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

### 2. Lazy Loading
- Images load only when entering viewport (50px before)
- Intersection Observer API for efficient detection
- Progressive image loading with placeholders

### 3. Touch Optimization
- All interactive elements have minimum 44px touch targets
- Passive event listeners where possible
- Throttled scroll event handlers

### 4. Animation Performance
- Reduced motion support for accessibility
- CSS transforms over position changes
- RequestAnimationFrame for smooth scrolling

---

## Mobile-Specific Features

### 1. **Safe Area Insets**
Support for notched devices:
```tsx
<div className="safe-top safe-bottom">
  Content respects notch areas
</div>
```

### 2. **Touch Gestures**
- Swipe to close (drawer)
- Pull to refresh
- Long press actions
- Ripple effects on tap

### 3. **Responsive Navigation**
- Bottom tab bar on mobile
- Slide-out drawer menu
- Collapsible header search

### 4. **Mobile Optimizations**
```css
@media (max-width: 768px) {
  button, a, input, select, textarea {
    @apply touch-target; /* Minimum 44px */
  }
}
```

---

## Accessibility Features

### 1. **Reduced Motion**
Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2. **Keyboard Navigation**
- Focus indicators on all interactive elements
- ESC key support for closing modals/drawers
- Proper ARIA labels

### 3. **Screen Readers**
```tsx
<span className="sr-only">Screen reader only text</span>
```

### 4. **Color Contrast**
All colors meet WCAG AA standards for accessibility.

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

All modern browsers with CSS Grid, Flexbox, and Intersection Observer support.

---

## Next Steps

The UI/UX foundation is now complete. Future enhancements could include:

1. Dark mode toggle implementation
2. Advanced gesture controls (pinch-to-zoom)
3. Haptic feedback on mobile
4. More animation variants
5. Custom theme builder

---

## Component Reference Quick Guide

```tsx
// Loading
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { LoadingOverlay, LoadingButton } from '@/components/ui/loading-overlay';

// Images
import { ResponsiveImage, Avatar, ImageGallery } from '@/components/ui/responsive-image';

// Animations
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedCard, InteractiveCard, GlassCard } from '@/components/ui/animated-card';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

// Hooks
import { useSwipeGesture, useLongPress } from '@/hooks';
import { useSmoothScroll, useScrollPosition, useInfiniteScroll } from '@/hooks';
```

---

**Documentation Version:** 1.0
**Last Updated:** 2025-10-22
**Author:** Claude Code Implementation Agent
