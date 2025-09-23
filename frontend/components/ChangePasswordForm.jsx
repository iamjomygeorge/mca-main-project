// frontend/components/ChangePasswordForm.jsx

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";

export default function ChangePasswordForm() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update password.");
      }

      setSuccess("Password updated successfully!");
      clearForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonInputClasses =
    "block w-full appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm";
  const commonLabelClasses =
    "block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Update your password below. Make sure it's a strong one!
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-500/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      <div className="p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-8">
        <h2 className="text-lg font-semibold border-b pb-4 border-zinc-200 dark:border-zinc-700">
          Security Details
        </h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className={commonLabelClasses}
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={commonInputClasses}
              />
            </div>
          </div>
          <div>
            <label htmlFor="newPassword" className={commonLabelClasses}>
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={commonInputClasses}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className={commonLabelClasses}
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={commonInputClasses}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 dark:disabled:bg-sky-500/50 transition-colors duration-200"
        >
          {isSubmitting ? (
            <Icons.spinner className="h-5 w-5" />
          ) : (
            <Icons.password className="h-5 w-5" />
          )}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}