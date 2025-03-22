import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "@/data/games";

// Lazy load the GameDialog component
const GameDialog = lazy(() => import("./GameDialog"));

interface LazyGameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GameDialogSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg p-6 w-[700px] max-w-[90vw]">
      <Skeleton className="h-56 w-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

const LazyGameDialog: React.FC<LazyGameDialogProps> = (props) => {
  if (!props.open) return null;

  return (
    <Suspense fallback={<GameDialogSkeleton />}>
      <GameDialog {...props} />
    </Suspense>
  );
};

export default LazyGameDialog;
