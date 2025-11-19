import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Base Skeleton component for loading states
 * Provides smooth pulse animation for better UX
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    shimmer?: boolean
  }
>(({ className, shimmer = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md",
      shimmer ? "skeleton-shimmer" : "skeleton",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

/**
 * SkeletonText - For loading text content
 */
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    lines?: number
    shimmer?: boolean
  }
>(({ className, lines = 3, shimmer = false, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        shimmer={shimmer}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
      />
    ))}
  </div>
))
SkeletonText.displayName = "SkeletonText"

/**
 * SkeletonCard - For loading card components
 */
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    shimmer?: boolean
  }
>(({ className, shimmer = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card shadow-sm p-6 space-y-4",
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="space-y-2">
      <Skeleton shimmer={shimmer} className="h-6 w-3/4" />
      <Skeleton shimmer={shimmer} className="h-4 w-1/2" />
    </div>
    {/* Content */}
    <SkeletonText lines={3} shimmer={shimmer} />
    {/* Footer */}
    <div className="flex gap-2 pt-2">
      <Skeleton shimmer={shimmer} className="h-10 w-24" />
      <Skeleton shimmer={shimmer} className="h-10 w-24" />
    </div>
  </div>
))
SkeletonCard.displayName = "SkeletonCard"

/**
 * SkeletonAvatar - For loading user avatars
 */
const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg" | "xl"
    shimmer?: boolean
  }
>(({ className, size = "md", shimmer = false, ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  }

  return (
    <Skeleton
      ref={ref}
      shimmer={shimmer}
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
})
SkeletonAvatar.displayName = "SkeletonAvatar"

/**
 * SkeletonTable - For loading table data
 */
const SkeletonTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    rows?: number
    columns?: number
    shimmer?: boolean
  }
>(({ className, rows = 5, columns = 4, shimmer = false, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} shimmer={shimmer} className="h-8" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={`row-${rowIndex}`}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`cell-${rowIndex}-${colIndex}`}
            shimmer={shimmer}
            className="h-12"
          />
        ))}
      </div>
    ))}
  </div>
))
SkeletonTable.displayName = "SkeletonTable"

/**
 * SkeletonList - For loading list items
 */
const SkeletonList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    items?: number
    shimmer?: boolean
    withAvatar?: boolean
  }
>(({ className, items = 5, shimmer = false, withAvatar = false, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        {withAvatar && <SkeletonAvatar shimmer={shimmer} size="md" />}
        <div className="flex-1 space-y-2">
          <Skeleton shimmer={shimmer} className="h-4 w-3/4" />
          <Skeleton shimmer={shimmer} className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
))
SkeletonList.displayName = "SkeletonList"

/**
 * SkeletonChart - For loading chart placeholders
 */
const SkeletonChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    shimmer?: boolean
  }
>(({ className, shimmer = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  >
    {/* Chart title and legend */}
    <div className="flex items-center justify-between">
      <Skeleton shimmer={shimmer} className="h-6 w-40" />
      <div className="flex gap-2">
        <Skeleton shimmer={shimmer} className="h-4 w-16" />
        <Skeleton shimmer={shimmer} className="h-4 w-16" />
      </div>
    </div>
    {/* Chart area */}
    <Skeleton shimmer={shimmer} className="h-64 w-full" />
    {/* Chart footer/stats */}
    <div className="grid grid-cols-3 gap-4">
      <Skeleton shimmer={shimmer} className="h-16" />
      <Skeleton shimmer={shimmer} className="h-16" />
      <Skeleton shimmer={shimmer} className="h-16" />
    </div>
  </div>
))
SkeletonChart.displayName = "SkeletonChart"

/**
 * SkeletonForm - For loading form states
 */
const SkeletonForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    fields?: number
    shimmer?: boolean
  }
>(({ className, fields = 4, shimmer = false, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-6", className)} {...props}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton shimmer={shimmer} className="h-4 w-24" />
        <Skeleton shimmer={shimmer} className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton shimmer={shimmer} className="h-10 w-32" />
      <Skeleton shimmer={shimmer} className="h-10 w-24" />
    </div>
  </div>
))
SkeletonForm.displayName = "SkeletonForm"

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonTable,
  SkeletonList,
  SkeletonChart,
  SkeletonForm
}
