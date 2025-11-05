"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";

const formatTimestamp = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

function MessageItem({ message, token, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusClasses = (status) => {
    switch (status) {
      case "NEW":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
      case "READ":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-zinc-100 dark:bg-zinc-700";
    }
  };

  const getRoleClasses = (role) => {
    switch (role) {
      case "AUTHOR":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "READER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";
    }
  };

  const handleSetStatus = async (status) => {
    if (isUpdating || message.status === status) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages/${message.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: status }),
        }
      );
      if (!response.ok) throw new Error("Failed to update status");
      const updatedMessage = await response.json();
      onUpdate(updatedMessage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the message from ${message.full_name}?`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages/${message.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete message");
      onDelete(message.id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && message.status === "NEW") {
      handleSetStatus("READ");
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(
                message.status
              )}`}
            >
              {message.status}
            </span>
            {message.user_role && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleClasses(
                  message.user_role
                )}`}
              >
                {message.user_role}
              </span>
            )}
          </div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {message.full_name}{" "}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              ({message.email})
            </span>
          </p>
        </div>
        <div className="flex-shrink-0 text-right ml-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatTimestamp(message.created_at)}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {message.message}
          </p>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSetStatus("RESOLVED")}
                disabled={isUpdating || message.status === "RESOLVED"}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => handleSetStatus("NEW")}
                disabled={isUpdating || message.status === "NEW"}
                className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
              >
                Mark as New
              </button>
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              <Icons.spinner
                className={`h-4 w-4 ${isDeleting ? "block" : "hidden"}`}
              />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMessagesPage() {
  const { token, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!token) {
      if (!authLoading) setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: "Failed to load messages." }));
        throw new Error(errData.error || "Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Callback for a MessageItem to update its state in our list
  const handleUpdateMessage = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
    );
  };

  // Callback for a MessageItem to delete it from our list
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

      {loading && (
        <p className="text-center text-zinc-500">Loading messages...</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Error: {error}
          </p>
        </div>
      )}

      {!loading && !error && (
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