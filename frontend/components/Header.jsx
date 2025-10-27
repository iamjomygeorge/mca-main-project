"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Inkling Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold">Inkling</span>
          </Link>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-5 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"></div>
            ) : user ? (
              <>
                {user.role === "READER" && (
                  <Link
                    href="/my-library"
                    className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    My Library
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Administrator Dashboard
                  </Link>
                )}
                {user.role === "AUTHOR" && (
                  <Link
                    href="/author"
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Author Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Logout ({user.email})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-50 shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}