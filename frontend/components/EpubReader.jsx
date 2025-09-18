"use client";

import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

export default function EpubReader({ url }) {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (url && viewerRef.current) {
      viewerRef.current.innerHTML = '';
      
      const book = ePub(url);
      
      const rendition = book.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
      });

      renditionRef.current = rendition;

      rendition.on('displayed', () => {
        setIsLoading(false);
      });
      
      rendition.display();

      return () => {
        book.destroy();
      };
    }
  }, [url]);

  const nextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const prevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-zinc-100 dark:bg-zinc-800">
          <p className="text-lg">Loading Book...</p>
        </div>
      )}
      <div ref={viewerRef} className="w-full h-full" />
      
      {!isLoading && (
        <>
          <button 
            onClick={prevPage} 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-800 text-white p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity z-10"
            aria-label="Previous Page"
          >
            &lt;
          </button>
          <button 
            onClick={nextPage} 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 text-white p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity z-10"
            aria-label="Next Page"
          >
            &gt;
          </button>
        </>
      )}
    </div>
  );
}