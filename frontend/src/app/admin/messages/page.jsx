"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";
import { api } from "@/services/api.service";
import MessageItem from "@/components/MessageItem";
import Skeleton from "@/components/Skeleton";

export default function AdminMessagesPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/admin/messages", { token });
      setMessages(data);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token, fetchMessages]);

  const handleUpdateMessage = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
    );
  };

  const handleDeleteMessage = (deletedId) => {
    setMessages((prev) => prev.filter((m) => m.id !== deletedId));
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          View and manage contact form submissions.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Error: {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 p-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-2/3 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                token={token}
                onUpdate={handleUpdateMessage}
                onDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <Icons.mail className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Inbox is empty
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                You have no new messages.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
