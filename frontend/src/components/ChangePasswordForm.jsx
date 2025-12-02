"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import { api } from "@/services/api.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const { token } = useAuth();
  const router = useRouter();
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
      const responseData = await api.put(
        "/api/admin/password",
        { currentPassword, newPassword },
        { token }
      );

      setSuccess(responseData.message || "Password updated successfully!");
      clearForm();
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Update your administrator password below.
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
          <Input
            label="Current Password"
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          type="submit"
          isLoading={isSubmitting}
          icon={<Icons.password className="h-5 w-5" />}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
