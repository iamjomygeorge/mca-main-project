import BookCover from "./BookCover";
import Link from "next/link";

export default function BookCard({ book, isLibraryCard = false }) {
  const bookUrl = isLibraryCard ? `/read/${book.id}` : `/books/${book.id}`;

  return (
    <Link
      href={bookUrl}
      className="group block h-full focus-visible:outline-none"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-lg bg-white dark:bg-zinc-800 shadow transition-shadow duration-300 ease-in-out group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-sky-500 group-focus-visible:ring-offset-2 dark:ring-offset-zinc-950">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <BookCover
            book={book}
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors duration-200 line-clamp-2">
            {book.title.replace(/\s*[\(\[].*?[\)\]]/g, "")}
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
            by {book.author_name}
          </p>
          {isLibraryCard && (
            <div className="mt-auto pt-3">
              <span className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-500 w-full transition-colors duration-200">
                Read Now
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
