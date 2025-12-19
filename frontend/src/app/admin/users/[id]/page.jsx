"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api.service";
import { Icons } from "@/components/Icons";
import { format } from "date-fns";

export default function UserDetailsPage({ params }) {
  const { id } = use(params);
  const { token } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/admin/users/${id}`, { token });
      setUser(data.user);
      setPurchases(data.purchases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (token) fetchUserDetails();
  }, [token, fetchUserDetails]);

  const handleBanToggle = async () => {
    const action = user.is_banned ? "activate" : "suspend";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setUpdating(true);
      const response = await api.patch(
        `/api/admin/users/${id}/status`,
        { is_banned: !user.is_banned },
        { token }
      );
      setUser((prev) => ({ ...prev, is_banned: response.is_banned }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <Icons.arrowLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              User ID: {user.id}
            </p>
            {user.is_banned && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                Suspended
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Profile Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Email
                </label>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-200">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Role
                </label>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-200 capitalize">
                  {user.role.toLowerCase()}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Joined On
                </label>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-200">
                  {format(new Date(user.created_at), "PPP p")}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Authentication
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-zinc-900 dark:text-zinc-200 capitalize">
                    {user.auth_method}
                  </span>
                  {user.two_factor_enabled && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      2FA ON
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleBanToggle}
                  disabled={updating}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    user.is_banned
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  }`}
                >
                  {user.is_banned ? "Activate Account" : "Suspend Account"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Purchase History
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3">Book</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {purchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        No purchases found.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                          {purchase.book_title || "Deleted Book"}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {format(new Date(purchase.created_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                          ₹{purchase.purchase_price}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              purchase.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
