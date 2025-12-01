"use client";

import { useEffect } from "react";
import Container from "@/components/Container";
import logger from "@/utils/logger";

export default function Error({ error, reset }) {
  useEffect(() => {
    logger.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 text-red-600 dark:text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Something went wrong
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error occurred while
        processing your request.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-md px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          Go Home
        </button>
        <button
          onClick={() => reset()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          Try again
        </button>
      </div>
    </Container>
  );
}
