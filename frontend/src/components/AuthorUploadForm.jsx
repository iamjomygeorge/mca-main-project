"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api.service";
import BookForm from "@/components/BookForm";

export default function AuthorUploadForm() {
  const { token } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async (formData, clearFormCallback) => {
    setIsSubmitting(true);
    setSuccess("");
    setError(null);

    try {
      const responseData = await api.post("/api/author/books", formData, {
        token,
      });
      setSuccess(`Book "${responseData.title}" uploaded successfully!`);
      clearFormCallback();
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookForm
      isAdmin={false}
      onSubmit={handleUpload}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
    />
  );
}
