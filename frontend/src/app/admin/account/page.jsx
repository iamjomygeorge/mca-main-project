"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import ChangePasswordForm from "@/components/ChangePasswordForm";

const Enable2FA = ({ token, onStatusChange, router }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/2fa/enable-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.push("/login?redirect=/admin/account");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send code.");

      setSuccess(data.message || "Verification code sent to your email.");
      setVerificationSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/2fa/enable-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token: otpCode }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.push("/login?redirect=/admin/account");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to verify code.");

      setSuccess(data.message || "2FA enabled successfully!");
      setVerificationSent(false);
      setOtpCode("");
      onStatusChange(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputClasses =
    "block w-full max-w-xs appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm";
  const commonLabelClasses =
    "block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1";

  return (
    <div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Add an extra layer of security. We'll send a code to your email each
        time you log in.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}
      {success && !verificationSent && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-500/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      {!verificationSent ? (
        <button
          onClick={handleSendCode}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 transition-colors duration-200"
        >
          {isLoading ? (
            <Icons.spinner className="h-5 w-5" />
          ) : (
            <Icons.password className="h-5 w-5" />
          )}
          {isLoading ? "Sending Code..." : "Enable Email 2FA"}
        </button>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          {success && (
            <div className="mb-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-500/30">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {success}
              </p>
            </div>
          )}
          <div>
            <label htmlFor="otpCode" className={commonLabelClasses}>
              Verification Code
            </label>
            <input
              type="text"
              id="otpCode"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              maxLength={6}
              pattern="\d{6}"
              inputMode="numeric"
              className={commonInputClasses}
              placeholder="Enter 6-digit code"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
            className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <Icons.spinner className="h-5 w-5" />
            ) : (
              <Icons.password className="h-5 w-5" />
            )}
            {isLoading ? "Verifying..." : "Verify & Enable"}
          </button>
          <button
            type="button"
            onClick={() => setVerificationSent(false)}
            disabled={isLoading}
            className="ml-4 text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

const Disable2FA = ({ token, onStatusChange, router }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleDisableRequest = () => {
    setError(null);
    setSuccess(null);
    setShowPasswordInput(true);
  };

  const handleConfirmDisable = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError("Password is required to disable 2FA.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/2fa/disable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        router.push("/login?redirect=/admin/account");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to disable 2FA.");

      setSuccess(data.message || "2FA disabled successfully.");
      setShowPasswordInput(false);
      setCurrentPassword("");
      onStatusChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputClasses =
    "block w-full max-w-xs appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm";
  const commonLabelClasses =
    "block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1";

  return (
    <div>
      <p className="text-sm text-green-600 dark:text-green-400 mb-4">
        Email Two-Factor Authentication is currently enabled.
      </p>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-500/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      {!showPasswordInput ? (
        <button
          onClick={handleDisableRequest}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Icons.password className="h-5 w-5" />
          Disable Email 2FA
        </button>
      ) : (
        <form
          onSubmit={handleConfirmDisable}
          className="space-y-4 border-t border-zinc-200 dark:border-zinc-700 pt-6 mt-6"
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your current password to confirm disabling 2FA.
          </p>
          <div>
            <label
              htmlFor="currentPasswordDisable"
              className={commonLabelClasses}
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPasswordDisable"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={commonInputClasses}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <Icons.spinner className="h-5 w-5" />
              ) : (
                <Icons.password className="h-5 w-5" />
              )}
              {isLoading ? "Disabling..." : "Confirm Disable"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordInput(false);
                setError(null);
                setCurrentPassword("");
              }}
              disabled={isLoading}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Disabling 2FA will reduce your account security.
      </p>
    </div>
  );
};

const TwoFactorAuthSection = () => {
  const { user, token, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [is2faCurrentlyEnabled, setIs2faCurrentlyEnabled] = useState(null);

  useEffect(() => {
    if (user) {
      setIs2faCurrentlyEnabled(user.two_factor_enabled);
    }
  }, [user]);

  const handleStatusChange = (newStatus) => {
    setIs2faCurrentlyEnabled(newStatus);
    if (refreshUser) {
      refreshUser();
    }
  };

  if (authLoading || is2faCurrentlyEnabled === null) {
    return (
      <div className="p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-6">
        <h2 className="text-lg font-semibold border-b pb-4 border-zinc-200 dark:border-zinc-700">
          Two-Factor Authentication
        </h2>
        <div className="animate-pulse h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
        <div className="animate-pulse h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-6">
      <h2 className="text-lg font-semibold border-b pb-4 border-zinc-200 dark:border-zinc-700">
        Two-Factor Authentication
      </h2>
      {is2faCurrentlyEnabled ? (
        <Disable2FA
          token={token}
          onStatusChange={handleStatusChange}
          router={router}
        />
      ) : (
        <Enable2FA
          token={token}
          onStatusChange={handleStatusChange}
          router={router}
        />
      )}
    </div>
  );
};

export default function AccountSettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Manage your administrator password and security settings.
        </p>
      </div>
      <ChangePasswordForm />
      <TwoFactorAuthSection />
    </div>
  );
}
