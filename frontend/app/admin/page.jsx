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
      {loading && value === null ? (
        <span className="text-zinc-300 dark:text-zinc-600 animate-pulse">...</span>
      ) : (
        value
      )}
    </p>
  </div>
);

export default function AdminDashboardPage() {
  const { token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!token) {
      if (!authLoading) {
        setError("You must be logged in to view this page.");
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard statistics.');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
    }
  }, [token, authLoading, isInitialLoading]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    fetchStats();

    const wsUrl = process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'USER_TABLE_UPDATED') {
          console.log("Update signal received. Refetching stats...");
          fetchStats();
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };
    
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
    
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [authLoading, fetchStats]);

  const displayValue = (statValue) => {
    if (error && !stats) return "-";
    return stats ? statValue.toLocaleString() : 0;
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Here's a snapshot of the platform.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
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