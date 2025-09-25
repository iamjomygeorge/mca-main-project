"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";

export default function FeaturedBooksPage() {
  const { token, loading: authLoading } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    if (!token) {
      if (!authLoading) {
        setError("You must be logged in to view this page.");
      }
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch books.");
      }

      const data = await response.json();
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const toggleFeatured = async (book) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/books/${book.id}/feature`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feature: !book.featured }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update book.");
      }

      const updatedBook = await response.json();

      // --- FIX: Only update the 'featured' property, keeping the author_name ---
      setBooks(
        books.map((b) =>
          b.id === updatedBook.id ? { ...b, featured: updatedBook.featured } : b
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Featured Books</h1>

      {loading && <p>Loading books...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book.id}>
                <BookCard book={book} />
                <button
                  onClick={() => toggleFeatured(book)}
                  className={`mt-2 w-full rounded-md px-3 py-2 text-sm font-medium ${
                    book.featured
                      ? "bg-zinc-900 text-white hover:bg-zinc-700"
                      : "bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
                  }`}
                >
                  {book.featured ? "Unfeature" : "Feature"}
                </button>
              </div>
            ))
          ) : (
            <p>No books have been published yet.</p>
          )}
        </div>
      )}
    </Container>
  );
}
