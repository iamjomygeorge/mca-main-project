"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BookCard from "@/components/BookCard";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";
import { api } from "@/services/api.service";

export default function MyBooksPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/author/my-books", { token });
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token, authLoading, fetchBooks]);

  const handleDeleteRequest = (bookId, bookTitle) => {
    setDeleteConfirmation({ id: bookId, title: bookTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/author/books/${deleteConfirmation.id}`, { token });

      setBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== deleteConfirmation.id)
      );
      setDeleteConfirmation(null);
    } catch (err) {
      setError(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
    setError(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          My Published Books
        </h1>
        <Link
          href="/author/upload"
          className="flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors duration-200"
        >
          <Icons.upload className="h-5 w-5" /> Upload New Book
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
          {[...Array(4)].map((_, i) => (
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
        <>
          {books.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
              {books.map((book) => (
                <div key={book.id} className="relative group">
                  <BookCard book={book} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleDeleteRequest(book.id, book.title)}
                      disabled={
                        isDeleting && deleteConfirmation?.id === book.id
                      }
                      className="p-1.5 bg-white dark:bg-zinc-700 rounded-full shadow text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Delete Book"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <Icons.book className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No books published yet
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Get started by uploading your first book.
              </p>
              <div className="mt-6">
                <Link
                  href="/author/upload"
                  className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  {" "}
                  <Icons.upload
                    className="-ml-0.5 mr-1.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  Upload Book
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-100">
              Confirm Deletion
            </h3>
            <div className="mt-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete the book "
                {deleteConfirmation.title}"? This action cannot be undone.
              </p>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3">Error: {error}</p>
            )}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2 disabled:opacity-50"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Icons.spinner className="h-5 w-5 mr-2" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-100 dark:ring-zinc-600 dark:hover:bg-zinc-600 sm:col-start-1 sm:mt-0"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
