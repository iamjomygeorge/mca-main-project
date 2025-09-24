"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/Icons";

const FileInput = ({
  label,
  required,
  accepted,
  file,
  setFile,
  previewUrl,
  inputRef,
  helpText,
}) => {
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

  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors cursor-pointer border-zinc-300 dark:border-zinc-700 ${
          isDragging ? "bg-sky-50 dark:bg-sky-900/20" : ""
        }`}
      >
        {file && previewUrl ? (
          <div className="text-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto h-32 w-auto rounded-md"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {file.name}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="mt-2 text-xs font-semibold text-red-600 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <Icons.upload className="mx-auto h-12 w-12 text-zinc-400" />
            <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <label
                htmlFor={label}
                className="relative cursor-pointer rounded-md font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 dark:text-sky-400 hover:text-sky-500"
              >
                <span>Upload a file</span>
                <input
                  ref={inputRef}
                  id={label}
                  type="file"
                  accept={accepted}
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-zinc-500">{helpText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminUploadForm() {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coverImageInputRef = useRef(null);
  const bookFileInputRef = useRef(null);

  const coverImagePreviewUrl = coverImageFile
    ? URL.createObjectURL(coverImageFile)
    : null;
  const bookFilePreviewUrl = bookFile
    ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZHRoPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJvb2stbWFyayI+PHBhdGggZD0iTTQgMTkuNXYtMTVBMiS1IDIuNSAwIDAgMSA2LjUgMkgMjB2MjBINi41YTIuNSAyLjUgMCAwIDEgMC01SDIwIi8+PHBhdGggZD0ibTkgMTAtMyAzIDUtMy01LTMgMyAzIi8+PC9zdmc+"
    : null;

  const clearForm = () => {
    setTitle("");
    setAuthorName("");
    setDescription("");
    setCoverImageFile(null);
    setBookFile(null);
    if (coverImageInputRef.current) coverImageInputRef.current.value = "";
    if (bookFileInputRef.current) bookFileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError(null);

    if (!bookFile || !title || !authorName || !coverImageFile) {
      setError("Title, Author, Cover Image, and EPUB File are required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author_name", authorName);
    formData.append("description", description);
    formData.append("bookFile", bookFile);
    formData.append("coverImageFile", coverImageFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/books`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload book");
      }
      const uploadedBook = await response.json();
      setSuccess(`Book "${uploadedBook.title}" uploaded successfully!`);
      clearForm();
    } catch (err) {
      setError(`${err.message}`);
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
        <h1 className="text-3xl font-bold tracking-tight">Upload a New Book</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Fill in the details below to add a new classic to the collection.
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
          Book Details
        </h2>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <label htmlFor="title" className={commonLabelClasses}>
              Book Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={commonInputClasses}
              />
            </div>
          </div>
          <div>
            <label htmlFor="authorName" className={commonLabelClasses}>
              Author's Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                className={commonInputClasses}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={commonLabelClasses}>
            Description
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className={commonInputClasses}
            />
          </div>
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-8">
        <h2 className="text-lg font-semibold border-b pb-4 border-zinc-200 dark:border-zinc-700">
          Book Files
        </h2>
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
          <FileInput
            label="Book Cover"
            required
            accepted="image/*"
            file={coverImageFile}
            setFile={setCoverImageFile}
            previewUrl={coverImagePreviewUrl}
            inputRef={coverImageInputRef}
            helpText="PNG OR JPG up to 10MB"
          />
          <FileInput
            label="EPUB File"
            required
            accepted=".epub"
            file={bookFile}
            setFile={setBookFile}
            previewUrl={bookFilePreviewUrl}
            inputRef={bookFileInputRef}
            helpText="EPUB files only"
          />
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
            <Icons.upload className="h-5 w-5" />
          )}
          {isSubmitting ? "Uploading..." : "Upload Book"}
        </button>
      </div>
    </form>
  );
}