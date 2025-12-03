"use client";

import { useEffect } from "react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/Button";

export default function BooksError({ error, reset }) {
  useEffect(() => {
    console.error("Books Page Error:", error);
  }, [error]);

  return (
    <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-red-600 dark:text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Unable to load library
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
        We encountered an error while retrieving the book collection.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button
          onClick={() => (window.location.href = "/")}
          className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          Go Home
        </Button>
      </div>
    </Container>
  );
}
