"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icons } from "@/components/Icons";
import { api } from "@/services/api.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isAuthorSignUp = role === "author";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const userData = {
      fullName,
      email,
      password,
      role: isAuthorSignUp ? "AUTHOR" : "READER",
      ...(isAuthorSignUp && { username }),
    };

    try {
      await api.post("/api/auth/register", userData);
      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setError(null);
    setIsGoogleLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const googleButtonClasses =
    "flex w-full justify-center items-center gap-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {isAuthorSignUp ? "Create an Author Account" : "Create your Account"}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Log in
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-500/30">
          <p className="text-sm text-center font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          id="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading || isGoogleLoading}
        />

        {isAuthorSignUp && (
          <div>
            <Input
              label="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Your unique public handle (letters, numbers, hyphens only).
            </p>
          </div>
        )}

        <Input
          label="Email address"
          id="email-address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={isLoading || isGoogleLoading}
        />

        <div>
          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={isLoading || isGoogleLoading}
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Must be at least 8 characters, including uppercase, lowercase,
            number, and special character.
          </p>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            isLoading={isLoading}
            className="w-full"
          >
            {isAuthorSignUp ? "Create Author Account" : "Sign Up with Email"}
          </Button>
        </div>
      </form>

      {!isAuthorSignUp && (
        <>
          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                or
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
              className={googleButtonClasses}
            >
              {isGoogleLoading ? (
                <Icons.spinner className="h-5 w-5 animate-spin" />
              ) : (
                <Icons.google className="h-5 w-5" />
              )}
              {isGoogleLoading ? "Redirecting..." : "Sign up with Google"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
