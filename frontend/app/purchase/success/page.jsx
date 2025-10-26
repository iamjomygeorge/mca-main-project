"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (refreshUser) {
      const timer = setTimeout(() => {
        refreshUser();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshUser, sessionId]);

  return (
    <Container className="py-20 text-center">
      <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
        Payment Successful!
      </h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8">
        Thank you for your purchase. The book has been added to your library.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/my-library"
          className="rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
        >
          Go to My Library
        </Link>
        <Link
          href="/books"
          className="rounded-md bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
        >
          Browse More Books
        </Link>
      </div>
      {/* You can optionally show the session ID for debugging */}
      {/* {sessionId && <p className="text-xs text-zinc-400 mt-6">Session ID: {sessionId}</p>} */}
    </Container>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <Container className="py-20 text-center">
          <p>Loading...</p>
        </Container>
      }
    >
      <SuccessContent />
    </React.Suspense>
  );
}

import React from "react";