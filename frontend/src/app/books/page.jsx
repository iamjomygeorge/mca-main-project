"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import BookGridSkeleton from "@/components/BookGridSkeleton";
import { api } from "@/services/api.service";

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
        <BookGridSkeleton count={18} />
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
