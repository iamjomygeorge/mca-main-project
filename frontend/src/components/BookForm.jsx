"use client";

import { useState, useRef } from "react";
import FileInput from "@/components/FileInput";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/Icons";

export default function BookForm({
  onSubmit,
  isSubmitting,
  error,
  success,
  authors = [],
  isAdmin = false,
}) {
  const [title, setTitle] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [currency, setCurrency] = useState("INR");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);

  const [formError, setFormError] = useState(null);

  const coverImageInputRef = useRef(null);
  const bookFileInputRef = useRef(null);

  const coverImagePreviewUrl = coverImageFile
    ? URL.createObjectURL(coverImageFile)
    : null;
  const bookFilePreviewUrl = bookFile
    ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZHRoPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik00IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJIMjB2MjBINi41YTIuNSAyLjUgMCAwIDEgMC01SDIwIi8+PC9zdmc+"
    : null;

  const clearForm = () => {
    setTitle("");
    setSelectedAuthorId("");
    setNewAuthorName("");
    setDescription("");
    setPrice("0.00");
    setCoverImageFile(null);
    setBookFile(null);
    if (coverImageInputRef.current) coverImageInputRef.current.value = "";
    if (bookFileInputRef.current) bookFileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) return setFormError("Book Title is required.");

    if (isAdmin) {
      const authorIsSelected = selectedAuthorId && selectedAuthorId !== "new";
      const newAuthorIsEntered =
        selectedAuthorId === "new" && newAuthorName.trim() !== "";
      if (!authorIsSelected && !newAuthorIsEntered) {
        return setFormError("Please select an author or add a new one.");
      }
    } else {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return setFormError("Please enter a valid, non-negative price.");
      }
    }

    if (!coverImageFile) return setFormError("A Cover Image is required.");
    if (!bookFile) return setFormError("An EPUB file is required.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("coverImageFile", coverImageFile);
    formData.append("bookFile", bookFile);

    if (isAdmin) {
      if (selectedAuthorId && selectedAuthorId !== "new") {
        formData.append("authorId", selectedAuthorId);
      } else {
        formData.append("newAuthorName", newAuthorName.trim());
      }
    } else {
      formData.append("price", parseFloat(price).toFixed(2));
      formData.append("currency", currency);
    }

    onSubmit(formData, clearForm);
  };

  const displayError = error || formError;

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload a New Book</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Fill in the details below to add a new book.
        </p>
      </div>

      {displayError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-500/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {displayError}
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
          <Input
            label="Book Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {isAdmin ? (
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1"
              >
                Author <span className="text-red-500">*</span>
              </label>
              <select
                id="author"
                value={selectedAuthorId}
                onChange={(e) => setSelectedAuthorId(e.target.value)}
                className="block w-full appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              >
                <option value="" disabled>
                  Select an Author
                </option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
                <option value="new">Add New Author</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1">
                Price ({currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0.00"
                step="0.01"
                className="block w-full appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              />
            </div>
          )}
        </div>

        {isAdmin && selectedAuthorId === "new" && (
          <Input
            label="New Author's Name"
            required
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
          />
        )}

        <div>
          <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="block w-full appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
          />
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-8">
        <h2 className="text-lg font-semibold border-b pb-4 border-zinc-200 dark:border-zinc-700">
          Book Files
        </h2>
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-8">
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
        <Button
          type="submit"
          isLoading={isSubmitting}
          icon={<Icons.upload className="h-5 w-5" />}
        >
          {isSubmitting ? "Uploading..." : "Upload Book"}
        </Button>
      </div>
    </form>
  );
}
