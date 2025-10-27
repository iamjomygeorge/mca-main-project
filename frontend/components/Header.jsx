"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Container from "./Container";

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <Container className="flex h-full items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Inkling Logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="text-xl font-semibold tracking-tight">Inkling</span>
        </Link>

        <nav className="flex items-center gap-x-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {loading ? (
            <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"></div>
          ) : user ? (
            <>
              {user.role === "READER" && (
                <Link
                  href="/my-library"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  My Library
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sky-600 hover:underline dark:text-sky-400"
                >
                  Administrator Dashboard
                </Link>
              )}
              {user.role === "AUTHOR" && (
                <Link
                  href="/author"
                  className="text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Author Dashboard
                </Link>
              )}
              <div className="flex items-center gap-x-3 border-l border-zinc-200 pl-5 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}