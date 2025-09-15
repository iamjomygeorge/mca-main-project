import Link from 'next/link';
import Container from '@/components/Container';

export default function Home() {
  return (
    <main>
      <Container>
        <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The Standard for Digital Literary Assets
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A blockchain-based platform for authors to secure their work and a digital library where readers can own and read verifiable literary works.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/books"
              className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
            >
              Browse Books
            </Link>
            <Link
              href="/register?role=author"
              className="text-sm font-semibold leading-6"
            >
              Become an Author <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}