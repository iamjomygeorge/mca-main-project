"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";

export default function FileInput({
  label,
  required,
  accepted,
  file,
  setFile,
  previewUrl,
  inputRef,
  helpText,
  id,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const inputId = id || label.replace(/\s+/g, "-").toLowerCase() + "-input";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        role="button"
        tabIndex="0"
        aria-label={`Upload ${label}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors cursor-pointer border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
          isDragging ? "bg-sky-50 dark:bg-sky-900/20" : ""
        }`}
      >
        {file && previewUrl ? (
          <div className="text-center">
            {previewUrl.startsWith("data:image/svg") &&
            !accepted.includes("image") ? (
              <Icons.book className="mx-auto h-24 w-24 text-zinc-400" />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto h-32 w-auto object-contain rounded-md"
              />
            )}
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {file.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-2 text-xs font-semibold text-red-600 hover:text-red-500 focus:outline-none focus:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <Icons.upload className="mx-auto h-12 w-12 text-zinc-400" />
            <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <span className="relative cursor-pointer rounded-md font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500">
                Upload a file
                <input
                  ref={inputRef}
                  id={inputId}
                  name={inputId}
                  type="file"
                  accept={accepted}
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  tabIndex="-1"
                />
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-zinc-500">{helpText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
