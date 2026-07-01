"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContent } from "@/components/dashboard/page-header";
import ValidationLabContent from "./validation-content";

export default function ValidationLabPage() {
  return (
    <Suspense
      fallback={
        <PageContent>
          <Skeleton className="h-40 w-full" />
        </PageContent>
      }
    >
      <ValidationLabContent />
    </Suspense>
  );
}
