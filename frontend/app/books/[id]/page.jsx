"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import EpubReader from "@/components/EpubReader";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (e) {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  }
};

export default function BookReaderPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading: authLoading } = useAuth();

  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (searchParams.get("purchase") === "cancelled") {
      setError("Purchase was cancelled. You have not been charged.");
    }
  }, [searchParams]);

  const fetchBookData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    if (error !== "Purchase was cancelled. You have not been charged.") {
      setError(null);
    }
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`,
        { headers }
      );

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Book not found or server error." }));
        throw new Error(errData.error || "Failed to fetch book details.");
      }
      const data = await response.json();
      setBookData(data);
      setShowReader(data.isOwned || parseFloat(data.price) <= 0);
    } catch (err) {
      setError(err.message);
      setBookData(null);
      setShowReader(false);
    } finally {
      setLoading(false);
    }
  }, [id, token, error]);

  useEffect(() => {
    if (!authLoading && id) {
      fetchBookData();
    }
  }, [authLoading, id, fetchBookData]);

  const handlePurchase = async () => {
    if (!token || !user) {
      setError("You must be logged in to purchase.");
      router.push("/login?redirect=/books/" + id);
      return;
    }
    if (!bookData || bookData.isOwned || parseFloat(bookData.price) <= 0) {
      return;
    }

    setIsPurchasing(true);
    setError(null);
    try {
      const initiateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/purchase/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId: id }),
        }
      );
      const initiateData = await initiateResponse.json();
      if (!initiateResponse.ok) {
        throw new Error(initiateData.error || "Failed to start purchase.");
      }

      const { checkoutUrl } = initiateData;
      if (!checkoutUrl) {
        throw new Error("Could not retrieve payment session URL.");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }

      const sessionId = new URL(checkoutUrl).searchParams.get("id");
      if (!sessionId) {
        console.warn(
          "Could not parse session ID from URL, redirecting to full URL."
        );
        window.location.href = checkoutUrl;
        return;
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (stripeError) {
        console.error("Stripe redirect error:", stripeError);
        throw new Error(
          stripeError.message || "Failed to redirect to payment page."
        );
      }
    } catch (err) {
      setError(`Purchase failed: ${err.message}`);
      setIsPurchasing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container className="py-12 flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </Container>
    );
  }

  if (
    error &&
    !bookData &&
    error !== "Purchase was cancelled. You have not been charged."
  ) {
    return (
      <Container className="py-12">
        <p className="text-red-500 text-center">Error: {error}</p>
      </Container>
    );
  }

  if (!bookData) {
    return (
      <Container className="py-12">
        <p className="text-red-500 text-center">Could not load book data.</p>
      </Container>
    );
  }

  const isFree = parseFloat(bookData.price) <= 0;

  return (
    <Container className="py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{bookData.title}</h1>
          <h2 className="text-xl text-zinc-600 dark:text-zinc-400">
            by {bookData.author_name}
          </h2>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          {!showReader ? (
            <button
              onClick={handlePurchase}
              disabled={isPurchasing || !user}
              title={
                !user
                  ? "Please log in to purchase"
                  : `Purchase for ${formatCurrency(
                      bookData.price,
                      bookData.currency
                    )}`
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isPurchasing ? (
                <Icons.spinner className="h-5 w-5" />
              ) : (
                <Icons.book className="h-5 w-5" /> // TODO: Find a 'cart' or 'buy' icon
              )}{" "}
              {isPurchasing
                ? "Redirecting..."
                : `Buy Now (${formatCurrency(
                    bookData.price,
                    bookData.currency
                  )})`}
            </button>
          ) : (
            <div className="text-right text-sm font-medium text-green-600 dark:text-green-400 p-2.5 border border-green-300 dark:border-green-700 rounded-md bg-green-50 dark:bg-green-900/20">
              {isFree ? "Free Access" : "Owned"}
            </div>
          )}
          {/* Show purchase-related errors (including 'cancelled' message) */}
          {error && !showReader && (
            <p
              className={`text-xs mt-1 text-right ${
                error.includes("cancelled")
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-red-500"
              }`}
            >
              {error}
            </p>
          )}
          {!user && !isFree && !showReader && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-right">
              Login required to purchase.
            </p>
          )}
        </div>
      </div>

      {showReader ? (
        <div
          style={{ height: "80vh", position: "relative" }}
          className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
        >
          <EpubReader url={bookData.book_file_url} />
        </div>
      ) : (
        <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 min-h-[40vh] flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-40 aspect-[2/3] relative">
            <Image
              src={bookData.cover_image_url || "/placeholder-cover.png"}
              alt={`Cover of ${bookData.title}`}
              fill
              sizes="160px"
              className="object-contain rounded shadow-lg"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold mb-2">
              Purchase required to read
            </p>
            <p className="max-w-prose text-zinc-600 dark:text-zinc-400 text-sm text-justify">
              {bookData.description || "No description available."}
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}