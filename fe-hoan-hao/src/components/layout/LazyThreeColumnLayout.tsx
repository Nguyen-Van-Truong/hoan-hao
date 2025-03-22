import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the ThreeColumnLayout component
const ThreeColumnLayout = lazy(() => import("./ThreeColumnLayout"));

// Create a loading placeholder that matches the layout structure
const LayoutSkeleton = () => (
  <div className="flex min-h-screen">
    <div className="w-1/4 p-4 border-r border-gray-200">
      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
    </div>
    <div className="w-2/4 p-4">
      <Skeleton className="h-40 w-full mb-6" />
      <Skeleton className="h-40 w-full mb-6" />
      <Skeleton className="h-40 w-full mb-6" />
    </div>
    <div className="w-1/4 p-4 border-l border-gray-200">
      <Skeleton className="h-40 w-full mb-6" />
      <Skeleton className="h-60 w-full mb-6" />
    </div>
  </div>
);

const LazyThreeColumnLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <ThreeColumnLayout>{children}</ThreeColumnLayout>
    </Suspense>
  );
};

export default LazyThreeColumnLayout;
