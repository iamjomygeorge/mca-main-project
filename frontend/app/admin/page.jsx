"use client";

import { Icons } from "@/components/Icons";
import Link from "next/link";

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
        <span className="text-zinc-300 dark:text-zinc-600">...</span>
      ) : (
        value
      )}
    </p>
  </div>
);

const QuickActionButton = ({ href, icon: Icon, children }) => (
  <Link
    href={href}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
  >
    <Icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {children}
    </span>
  </Link>
);

export default function AdminDashboardPage() {
  const stats = {
    totalReaders: 0,
    totalAuthors: 0,
    totalBooks: 0,
    monthlySales: "0",
  };
  const statsLoading = false;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Here's a snapshot of the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Readers"
          value={stats?.totalReaders.toLocaleString()}
          icon={Icons.users}
          loading={statsLoading}
        />
        <StatCard
          title="Total Authors"
          value={stats?.totalAuthors.toLocaleString()}
          icon={Icons.users}
          loading={statsLoading}
        />
        <StatCard
          title="Total Books"
          value={stats?.totalBooks.toLocaleString()}
          icon={Icons.book}
          loading={statsLoading}
        />
        <StatCard
          title="Monthly Sales"
          value={`₹${stats?.monthlySales}`}
          icon={Icons.overview}
          loading={statsLoading}
        />
      </div>
    </div>
  );
}
