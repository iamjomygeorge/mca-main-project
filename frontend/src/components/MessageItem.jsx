"use client";
import { useState } from "react";
import { Icons } from "@/components/Icons";
import { formatTimestamp } from "@/utils/formatters";
import { api } from "@/services/api.service";
import logger from "@/utils/logger";

export default function MessageItem({ message, token, onUpdate, onDelete }) {
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
      const updatedMessage = await api.put(
        `/api/admin/messages/${message.id}/status`,
        { status },
        { token }
      );
      onUpdate(updatedMessage);
    } catch (err) {
      logger.error("Error updating message status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the message from ${message.full_name}?`
      )
    )
      return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/messages/${message.id}`, { token });
      onDelete(message.id);
    } catch (err) {
      logger.error("Error deleting message:", err);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleExpand();
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <div
        role="button"
        tabIndex="0"
        aria-expanded={isExpanded}
        className="flex items-center justify-between p-4 cursor-pointer outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-t-lg"
        onClick={handleToggleExpand}
        onKeyDown={handleKeyDown}
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
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 animate-in slide-in-from-top-1 fade-in duration-200">
          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {message.message}
          </p>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetStatus("RESOLVED");
                }}
                disabled={isUpdating || message.status === "RESOLVED"}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                Mark as Resolved
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetStatus("NEW");
                }}
                disabled={isUpdating || message.status === "NEW"}
                className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                Mark as New
              </button>
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
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
