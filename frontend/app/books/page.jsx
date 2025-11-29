"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import Skeleton from "@/components/Skeleton";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/books`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message);
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

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="flex flex-col h-full">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {books.length > 0 ? (
            books.map((book) => <BookCard key={book.id} book={book} />)
          ) : (
            <p>No books have been published yet.</p>
          )}
        </div>
      )}
    </Container>
  );
}