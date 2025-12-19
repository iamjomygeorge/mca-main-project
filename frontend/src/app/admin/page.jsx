"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import StatCard from "@/components/StatCard";
import AnalyticsChart from "@/components/AnalyticsChart";
import RecentTransactions from "@/components/RecentTransactions";
import { api } from "@/services/api.service";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    if (!isInitialLoading) {
      setIsRefreshing(true);
    }

    try {
      const [statsData, chartsData, transactionsData] = await Promise.all([
        api.get("/api/admin/stats/overview", { token }),
        api.get("/api/admin/stats/charts", { token }),
        api.get("/api/admin/stats/recent-activity", { token }),
      ]);

      setStats(statsData);
      setCharts(chartsData);
      setTransactions(transactionsData);
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
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  const displayValue = (statValue) => {
    if (error && !stats) return "-";
    return stats ? statValue.toLocaleString() : 0;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Overview of platform performance and metrics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isInitialLoading ? (
          <>
            <div className="h-[350px] bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
            <div className="h-[350px] bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
          </>
        ) : (
          <>
            <AnalyticsChart
              title="Revenue (Last 30 Days)"
              data={charts?.revenue || []}
              color="#10b981"
              valuePrefix="₹"
            />
            <AnalyticsChart
              title="New User Registrations"
              data={charts?.users || []}
              color="#3b82f6"
            />
          </>
        )}
      </div>

      {!isInitialLoading && (
        <div className="mt-8">
          <RecentTransactions transactions={transactions} />
        </div>
      )}
    </div>
  );
}
