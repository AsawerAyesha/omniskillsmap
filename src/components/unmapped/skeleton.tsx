import * as React from "react";
import { cn } from "@/lib/utils";

export function USkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("u-skeleton", className)} {...props} />;
}

export function UCardSkeleton() {
  return (
    <div className="u-card">
      <USkeleton className="h-4 w-1/3 mb-3" />
      <USkeleton className="h-3 w-2/3 mb-2" />
      <USkeleton className="h-3 w-1/2" />
    </div>
  );
}