"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import Skeleton from "@/components/Skeleton";

export default function FeaturedBooksPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.push("/login?redirect=/admin/featured-books");
        return;
      }

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
  }, [token, router]);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token, fetchBooks]);

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

      if (response.status === 401 || response.status === 403) {
        router.push("/login?redirect=/admin/featured-books");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update book.");
      }

      const updatedBook = await response.json();

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

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex flex-col h-full">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="mt-2 h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book.id}>
                <BookCard book={book} />
                <button
                  onClick={() => toggleFeatured(book)}
                  className={`mt-2 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
