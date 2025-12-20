"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api.service";
import { Icons } from "@/components/Icons";
import { format } from "date-fns";

export default function MessagesPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [expandedId, setExpandedId] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        status: activeTab,
      }).toString();

      const data = await api.get(`/api/admin/messages?${query}`, { token });
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, activeTab]);

  useEffect(() => {
    if (token) fetchMessages();
  }, [fetchMessages, token]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(
        `/api/admin/messages/${id}/status`,
        { status: newStatus },
        { token }
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      await api.delete(`/api/admin/messages/${id}`, { token });
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      alert("Failed to delete message");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            View and manage user inquiries.
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg self-start w-fit">
        {["ALL", "NEW", "READ", "RESOLVED"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Sender</th>
                <th className="px-6 py-4 font-medium">Preview</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <Fragment key={msg.id}>
                    <tr
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(msg.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {msg.name}
                        </div>
                        <div className="text-xs text-zinc-500">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        <span className="line-clamp-1">
                          {msg.message.substring(0, 50)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            msg.status === "NEW"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : msg.status === "RESOLVED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-zinc-100 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {format(new Date(msg.created_at), "MMM d, yyyy")}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {msg.status !== "RESOLVED" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(msg.id, "RESOLVED")
                              }
                              className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded"
                              title="Mark as Resolved"
                            >
                              <Icons.mail className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === msg.id && (
                      <tr className="bg-zinc-50/50 dark:bg-zinc-800/20">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                              Full Message:
                            </h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                              {msg.message}
                            </p>
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Reply via Email
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
