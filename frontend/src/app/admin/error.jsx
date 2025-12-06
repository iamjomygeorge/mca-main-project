"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import logger from "@/utils/logger";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    logger.error("Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-dashed border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/50 dark:bg-red-900/10">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
        Dashboard Error
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center max-w-sm">
        Something went wrong while loading this administrative view.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white"
      >
        Reload Dashboard
      </Button>
    </div>
  );
}
