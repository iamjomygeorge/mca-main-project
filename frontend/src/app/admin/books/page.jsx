"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api.service";
import { Icons } from "@/components/Icons";
import { format } from "date-fns";

export default function BooksPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deletingId, setDeletingId] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: debouncedSearch,
        type: activeTab === "all" ? "" : activeTab,
      }).toString();

      const data = await api.get(`/api/admin/books?${query}`, { token });
      setBooks(data.books);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, debouncedSearch, activeTab]);

  useEffect(() => {
    if (token) fetchBooks();
  }, [fetchBooks, token]);

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    )
      return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/books/${id}`, { token });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Inventory</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage classic and community uploaded books.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/books/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icons.upload className="h-4 w-4" />
            Upload Classic
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg self-start">
          {["all", "classic", "community"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search books"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full sm:w-[300px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Book Details</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Sales</th>
                <th className="px-6 py-4 font-medium">Uploaded</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt=""
                            className="w-10 h-14 object-cover rounded shadow-sm border border-zinc-100 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                            <Icons.book className="h-5 w-5 text-zinc-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {book.title}
                          </div>
                          <div className="text-xs text-zinc-500 capitalize">
                            {book.category} • ₹{book.price}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {book.author_name}
                    </td>
                    <td className="px-6 py-4">
                      {book.is_classic ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                          Classic
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                          Community
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {book.sales_count}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {format(new Date(book.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(book.id)}
                        disabled={deletingId === book.id}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete Book"
                      >
                        {deletingId === book.id ? (
                          <Icons.spinner className="h-5 w-5" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
