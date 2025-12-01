import Link from "next/link";
import Container from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-32 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800">
        404
      </h1>
      <h2 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h2>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
        Sorry, we couldn’t find the page you’re looking for. It might have been
        removed or renamed.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/books"
          className="rounded-md px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          Browse Library
        </Link>
      </div>
    </Container>
  );
}
