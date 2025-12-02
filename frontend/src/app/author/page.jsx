"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api.service";

export default function AuthorDashboardPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get("/api/author/overview", { token });
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
