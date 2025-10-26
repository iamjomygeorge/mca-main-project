import Image from 'next/image';
import Link from 'next/link';

export default function BookCard({ book, isLibraryCard = false }) {
  const coverImage = book.cover_image_url || '/placeholder-cover.png';

  const bookUrl = isLibraryCard ? `/read/${book.id}` : `/books/${book.id}`;

  return (
    <Link href={bookUrl} className="group block w-full">
      <div className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg bg-zinc-100 dark:bg-zinc-800 transition-shadow duration-300 group-hover:shadow-xl">
        <div className="relative aspect-[2/3]">
          <Image
            src={coverImage}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
            priority={!isLibraryCard}
          />
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-bold text-lg truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            by {book.author_name}
          </p>
        </div>
      </div>
    </Link>
  );
}