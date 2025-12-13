"use client";

import Image from "next/image";
import { useMemo } from "react";

const GRADIENTS = [
  "bg-gradient-to-br from-blue-900 via-blue-950 to-black",
  "bg-gradient-to-br from-red-900 via-red-950 to-black",
  "bg-gradient-to-br from-emerald-900 via-emerald-950 to-black",
  "bg-gradient-to-br from-amber-900 via-amber-950 to-black",
  "bg-gradient-to-br from-slate-800 via-slate-900 to-black",
  "bg-gradient-to-br from-purple-900 via-purple-950 to-black",
  "bg-gradient-to-br from-cyan-900 via-cyan-950 to-black",
  "bg-gradient-to-br from-indigo-900 via-indigo-950 to-black",
  "bg-gradient-to-br from-rose-900 via-rose-950 to-black",
  "bg-gradient-to-br from-stone-800 via-stone-900 to-black",
];

export default function BookCover({ book, className = "" }) {
  const shouldSimulateCover =
    book.is_simulated ||
    !book.cover_image_url ||
    book.cover_image_url.includes("placehold.co") ||
    book.cover_image_url === "/placeholder-cover.png";

  const { gradient } = useMemo(() => {
    if (!book.title) return { gradient: GRADIENTS[0] };

    let hash = 0;
    for (let i = 0; i < book.title.length; i++) {
      hash = book.title.charCodeAt(i) + ((hash << 5) - hash);
    }

    return {
      gradient: GRADIENTS[Math.abs(hash) % GRADIENTS.length],
    };
  }, [book.title]);

  if (shouldSimulateCover) {
    return (
      <div
        className={`w-full h-full flex flex-col p-6 ${gradient} ${className} relative overflow-hidden text-center isolate shadow-lg ring-1 ring-inset ring-white/10 group`}
      >
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute inset-3 border border-white/20 pointer-events-none z-10" />

        <div className="relative z-20 flex-1 flex flex-col justify-center items-center px-2">
          <h3 className="font-libre text-xl sm:text-2xl leading-snug text-white font-bold tracking-tight drop-shadow-lg line-clamp-4 mb-3">
            {book.title.replace(/\s*[\(\[].*?[\)\]]/g, "")}
          </h3>

          <div className="w-8 h-[2px] bg-white/40 rounded-full mb-3" />

          <p className="font-sans text-xs sm:text-sm text-white/90 font-medium tracking-wide uppercase line-clamp-2">
            {book.author_name}
          </p>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/50 via-black/10 to-transparent pointer-events-none z-30 opacity-80" />
      </div>
    );
  }

  return (
    <Image
      src={book.cover_image_url}
      alt={`Cover of ${book.title}`}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className={`object-cover ${className}`}
    />
  );
}
