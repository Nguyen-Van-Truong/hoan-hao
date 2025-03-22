import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the EditProfileDialog component
const EditProfileDialog = lazy(() => import("./EditProfileDialog"));

interface LazyEditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedProfile: any) => void;
  initialData?: {
    name: string;
    bio: string;
    location: string;
    work: string;
    education: string;
    relationship: string;
    avatar: string;
    coverPhoto: string;
  };
}

const DialogSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[90vh]">
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

const LazyEditProfileDialog: React.FC<LazyEditProfileDialogProps> = (props) => {
  if (!props.open) return null;

  return (
    <Suspense fallback={<DialogSkeleton />}>
      <EditProfileDialog {...props} />
    </Suspense>
  );
};

export default LazyEditProfileDialog;
