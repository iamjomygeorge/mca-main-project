"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { api } from "@/services/api.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const Enable2FA = ({ token, onStatusChange }) => {
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
      const data = await api.post(
        "/api/admin/2fa/enable-request",
        {},
        { token }
      );
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
      const data = await api.post(
        "/api/admin/2fa/enable-verify",
        { token: otpCode },
        { token }
      );
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
        <Button
          onClick={handleSendCode}
          isLoading={isLoading}
          icon={<Icons.password className="h-5 w-5" />}
        >
          {isLoading ? "Sending Code..." : "Enable Email 2FA"}
        </Button>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          {success && (
            <div className="mb-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-500/30">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {success}
              </p>
            </div>
          )}

          <Input
            label="Verification Code"
            id="otpCode"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
            maxLength={6}
            pattern="\d{6}"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
            className="max-w-xs"
          />

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={otpCode.length !== 6}
              icon={<Icons.password className="h-5 w-5" />}
              className="bg-green-600 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-500"
            >
              {isLoading ? "Verifying..." : "Verify & Enable"}
            </Button>
            <button
              type="button"
              onClick={() => setVerificationSent(false)}
              disabled={isLoading}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const Disable2FA = ({ token, onStatusChange }) => {
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
      const data = await api.post(
        "/api/admin/2fa/disable",
        { currentPassword },
        { token }
      );
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
        <Button
          onClick={handleDisableRequest}
          isLoading={isLoading}
          icon={<Icons.password className="h-5 w-5" />}
          className="bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500"
        >
          Disable Email 2FA
        </Button>
      ) : (
        <form
          onSubmit={handleConfirmDisable}
          className="space-y-4 border-t border-zinc-200 dark:border-zinc-700 pt-6 mt-6"
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your current password to confirm disabling 2FA.
          </p>

          <Input
            label="Current Password"
            type="password"
            id="currentPasswordDisable"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="max-w-xs"
          />

          <div className="flex gap-4 items-center">
            <Button
              type="submit"
              isLoading={isLoading}
              icon={<Icons.password className="h-5 w-5" />}
              className="bg-red-600 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500"
            >
              {isLoading ? "Disabling..." : "Confirm Disable"}
            </Button>
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
  const [is2faCurrentlyEnabled, setIs2faCurrentlyEnabled] = useState(null);

  useEffect(() => {
    if (user) {
      setIs2faCurrentlyEnabled(user.two_factor_enabled);
    }
  }, [user]);

  const handleStatusChange = (newStatus) => {
    setIs2faCurrentlyEnabled(newStatus);
    if (refreshUser) refreshUser();
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
        <Disable2FA token={token} onStatusChange={handleStatusChange} />
      ) : (
        <Enable2FA token={token} onStatusChange={handleStatusChange} />
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
