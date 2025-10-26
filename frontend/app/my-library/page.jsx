"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import { Icons } from "@/components/Icons";
import Link from "next/link";

export default function MyLibraryPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLibrary = useCallback(async () => {
    if (!token) {
      if (!authLoading) setError("Please log in to view your library.");
      setLoading(false);
      setLibraryBooks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/my-library`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Failed to load library data." }));
        throw new Error(errData.error || "Failed to fetch your library");
      }
      const data = await response.json();
      setLibraryBooks(data);
    } catch (err) {
      setError(err.message);
      setLibraryBooks([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchLibrary();
    }
  }, [authLoading, fetchLibrary]);

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Library</h1>

      {loading && (
        <p className="text-center text-zinc-500">Loading your library...</p>
      )}

      {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

      {!loading && !error && (
        <>
          {libraryBooks.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
              {libraryBooks.map((book) => (
                <BookCard key={book.id} book={book} isLibraryCard={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <Icons.book className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Your library is empty
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Books you purchase will appear here.
              </p>
              <div className="mt-6">
                <Link
                  href="/books"
                  className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}