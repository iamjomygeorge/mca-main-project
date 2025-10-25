"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";

const StatCard = ({ title, value, icon: Icon, loading }) => (
  <div className="flex flex-col bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
    </div>
    <p className="mt-4 text-3xl font-semibold">
      {loading ? (
        <span className="text-zinc-300 dark:text-zinc-600 animate-pulse">
          ...
        </span>
      ) : (
        value ?? 0
      )}
    </p>
  </div>
);

export default function AuthorDashboardPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/author/overview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch stats.");
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
    } else if (!authLoading) {
      setError("You must be logged in as an author to view this page.");
      setLoading(false);
    }
  }, [token, authLoading, fetchStats]);

  const displayName = user?.full_name || "Author";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {displayName}!
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Here's a summary of your published works.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Error: {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Books Published"
          value={stats?.totalBooksPublished}
          icon={Icons.book}
          loading={loading}
        />
      </div>
    </div>
  );
}