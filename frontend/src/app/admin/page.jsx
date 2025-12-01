"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import Skeleton from "@/components/Skeleton";
import { api } from "@/services/api.service";

const StatCard = ({ title, value, icon: Icon, loading }) => (
  <div className="flex flex-col bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
    </div>
    <div className="mt-4">
      {loading ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <p className="text-3xl font-semibold">{value}</p>
      )}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    if (!isInitialLoading) {
      setIsRefreshing(true);
    }

    try {
      const data = await api.get("/api/admin/stats/overview", { token });
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
      setIsRefreshing(false);
    }
  }, [token, isInitialLoading]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  const displayValue = (statValue) => {
    if (error && !stats) return "-";
    return stats ? statValue.toLocaleString() : 0;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Here's a snapshot of the platform.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={isRefreshing}
          className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh stats"
        >
          <Icons.refresh
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Readers"
          value={displayValue(stats?.totalReaders)}
          icon={Icons.users}
          loading={isInitialLoading}
        />
        <StatCard
          title="Total Authors"
          value={displayValue(stats?.totalAuthors)}
          icon={Icons.users}
          loading={isInitialLoading}
        />
        <StatCard
          title="Total Books"
          value={displayValue(stats?.totalBooks)}
          icon={Icons.book}
          loading={isInitialLoading}
        />
      </div>
    </div>
  );
}
