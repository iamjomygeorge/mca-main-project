"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";

const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "google_access_denied":
      return "Access denied. You chose not to sign in with Google.";
    case "invalid_state":
      return "Authentication failed. Please try again.";
    case "google_email_unverified":
      return "Your Google account email is not verified. Please verify your email with Google first.";
    case "author_google_signin_prohibited":
      return "Authors must log in using their email and password.";
    case "google_auth_failed":
      return "Google Sign-In failed. Please try again or use email/password.";
    case "unknown_callback_error":
      return "An unexpected error occurred during sign-in. Please try again.";
    default:
      return errorCode || "An unknown error occurred. Please try again.";
  }
};

export default function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [step, setStep] = useState("credentials");
  const [tempToken, setTempToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(getErrorMessage(urlError));
      if (typeof window !== "undefined") {
        const url = new URL(window.location);
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  const commonInputClasses =
    "block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm";
  const commonLabelClasses =
    "block text-sm font-medium text-zinc-900 dark:text-zinc-100";
  const commonButtonClasses =
    "flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const googleButtonClasses =
    "flex w-full justify-center items-center gap-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data.error) || "Failed to log in");
      }

      if (data.twoFactorRequired) {
        setStep("otp");
        setTempToken(data.tempToken);
        setMessage(
          data.message || "A verification code has been sent to your email."
        );
      } else {
        login(data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-2fa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempToken: tempToken, token: otpCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data.error) || "Failed to verify 2FA code."
        );
      }

      login(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setMessage(null);
    setIsGoogleLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {step === "credentials"
            ? "Log in to your account"
            : "Enter Verification Code"}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {step === "credentials" && (
            <>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Sign up
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {error && !message && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-500/30">
          <p className="text-sm text-center font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}
      {message && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-500/30">
          <p className="text-sm text-center font-medium text-blue-800 dark:text-blue-200">
            {message}
          </p>
        </div>
      )}

      {step === "credentials" ? (
        <>
          <form className="space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="email-address" className={commonLabelClasses}>
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className={commonInputClasses}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className={commonLabelClasses}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={commonInputClasses}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className={commonButtonClasses}
              >
                {isLoading ? <Icons.spinner className="h-5 w-5" /> : null}
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                Reader Sign-In
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className={googleButtonClasses}
            >
              {isGoogleLoading ? (
                <Icons.spinner className="h-5 w-5" />
              ) : (
                <Icons.google className="h-5 w-5" />
              )}
              {isGoogleLoading ? "Redirecting..." : "Sign in with Google"}
            </button>
          </div>
        </>
      ) : (
        <form className="space-y-6" onSubmit={handleOtpSubmit}>
          <div>
            <label htmlFor="otp-code" className={commonLabelClasses}>
              6-Digit Code <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                id="otp-code"
                name="otpCode"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
                className={commonInputClasses}
                placeholder="Check your email"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className={commonButtonClasses}
            >
              {isLoading ? <Icons.spinner className="h-5 w-5" /> : null}
              {isLoading ? "Verifying..." : "Verify & Log In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError(null);
                setMessage(null);
                setTempToken(null);
                setOtpCode("");
              }}
              disabled={isLoading}
              className="mt-4 w-full text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}