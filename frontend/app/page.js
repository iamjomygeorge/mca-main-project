"use client";

import Link from "next/link";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import { useEffect, useState } from "react";
import { Icons } from "@/components/Icons";

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/books/featured`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setFeaturedBooks(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };

    fetchBooks();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-center">
        <Container className="pb-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The Standard for Digital Literary Assets
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            A blockchain-based platform for authors to secure their work and a
            digital library where readers can own and read verifiable literary
            works.
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
        </Container>
        <div className="absolute bottom-20 animate-bounce">
          <a href="#featured-books" aria-label="Scroll to featured books">
            <svg
              className="w-8 h-8 text-zinc-500 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </a>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && (
        <section id="featured-books" className="py-20 bg-white dark:bg-zinc-800">
          <Container>
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Featured Books
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              {featuredBooks.map((book) => (
                <div key={book.id} className="w-48 flex-shrink-0">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-center">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <Icons.author className="w-12 h-12 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold">For Authors</h3>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                Securely publish your work on an immutable ledger, ensuring
                ownership and authenticity.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <Icons.reader className="w-12 h-12 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold">For Readers</h3>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                Own and read verifiable literary works, knowing that you are
                supporting the original author.
              </p>
            </div>
            <div className="text-center">
               <div className="flex justify-center items-center mb-4">
                <Icons.users className="w-12 h-12 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold">For Everyone</h3>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                Join a decentralized literary marketplace that guarantees the
                authenticity and ownership of digital assets.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-zinc-800">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-center">
            What People Are Saying
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 rounded-lg bg-zinc-100 dark:bg-zinc-700">
              <p className="text-lg italic">
                &quot;Inkling has revolutionized the way I publish my books. I
                finally have peace of mind knowing my work is secure.&quot;
              </p>
              <p className="mt-4 font-semibold">- Jane Doe, Author</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-zinc-100 dark:bg-zinc-700">
              <p className="text-lg italic">
                &quot;As a reader, I love knowing that I&apos;m supporting the
                original authors directly. The reading experience is fantastic
                too!&quot;
              </p>
              <p className="mt-4 font-semibold">- John Smith, Reader</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-zinc-100 dark:bg-zinc-700">
              <p className="text-lg italic">
                &quot;This is the future of digital publishing. Inkling is a
                game-changer for the literary world.&quot;
              </p>
              <p className="mt-4 font-semibold">- Emily White, Critic</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 text-center bg-zinc-50 dark:bg-zinc-900">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight">
            Join Inkling Today
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Whether you&apos;re an author looking to secure your work or a
            reader in search of authentic digital literature, Inkling is the
            platform for you.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
            >
              Sign Up Now
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}