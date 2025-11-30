"use client";

import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import { Icons } from "@/components/Icons";

export default function EpubReader({ url }) {
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    let mounted = true;

    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load book: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (!mounted) return;

        if (bookRef.current) {
          bookRef.current.destroy();
        }
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        if (viewerRef.current) {
          viewerRef.current.innerHTML = "";

          const rendition = book.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "paginated",
            manager: "default",
          });

          renditionRef.current = rendition;

          await rendition.display();

          rendition.on("keyup", (e) => {
            if ((e.keyCode || e.which) == 37) prevPage();
            if ((e.keyCode || e.which) == 39) nextPage();
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading EPUB:", err);
        if (mounted) {
          setError("Failed to load the book. Please try again.");
          setIsLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      mounted = false;
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    const handleKeyUp = (e) => {
      if ((e.keyCode || e.which) == 37) prevPage();
      if ((e.keyCode || e.which) == 39) nextPage();
    };

    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const prevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const nextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-800">
          <Icons.spinner className="h-10 w-10 text-zinc-500 animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">
            Loading your book...
          </p>
        </div>
      )}

      <div ref={viewerRef} className="w-full h-full overflow-hidden" />

      {!isLoading && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 shadow-lg hover:bg-white dark:hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous Page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 shadow-lg hover:bg-white dark:hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next Page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
