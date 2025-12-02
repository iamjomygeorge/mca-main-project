"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";
import BookCard from "@/components/BookCard";
import BookGridSkeleton from "@/components/BookGridSkeleton";
import EmptyState from "@/components/EmptyState";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import { api } from "@/services/api.service";

export default function MyLibraryPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLibrary = useCallback(async () => {
    if (!token) {
      if (!authLoading) {
        router.push("/login?redirect=/my-library");
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/purchase/my-library", { token });
      setLibraryBooks(data);
    } catch (err) {
      setError(err.message);
      setLibraryBooks([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchLibrary();
    }
  }, [authLoading, fetchLibrary]);

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Library</h1>

      {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

      {loading ? (
        <BookGridSkeleton count={4} />
      ) : (
        <>
          {libraryBooks.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
              {libraryBooks.map((book) => (
                <BookCard key={book.id} book={book} isLibraryCard={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.book}
              title="Your library is empty"
              description="Books you purchase will appear here."
              action={
                <Link
                  href="/books"
                  className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Browse Books
                </Link>
              }
            />
          )}
        </>
      )}
    </Container>
  );
}
