"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import BookGridSkeleton from "@/components/BookGridSkeleton";
import { api } from "@/services/api.service";
import { Icons } from "@/components/Icons";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await api.get("/api/books");
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        setError("Failed to load the library. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">
        Browse the Library
      </h1>

      {loading ? (
        <BookGridSkeleton />
      ) : error ? (
        <div className="text-center py-10 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
          {error}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          <Icons.bookOpen className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            The library is empty
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            No books have been published yet. Check back soon!
          </p>
        </div>
      )}
    </Container>
  );
}
