"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AuthorError({ error, reset }) {
  useEffect(() => {
    console.error("Author Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-dashed border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
        Workspace Error
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center max-w-sm">
        We couldn't load your author workspace correctly.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
