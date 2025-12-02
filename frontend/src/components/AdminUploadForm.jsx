"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api.service";
import BookForm from "@/components/BookForm";

export default function AdminUploadForm() {
  const { token } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchAuthors = async () => {
      try {
        const data = await api.get("/api/admin/authors", { token });
        setAuthors(data);
      } catch (err) {
        setError("Could not load author list: " + err.message);
      }
    };
    fetchAuthors();
  }, [token]);

  const handleUpload = async (formData, clearFormCallback) => {
    setIsSubmitting(true);
    setSuccess("");
    setError(null);

    try {
      const uploadedBook = await api.post("/api/admin/books", formData, {
        token,
      });
      setSuccess(`Book "${uploadedBook.title}" uploaded successfully.`);
      clearFormCallback();
    } catch (err) {
      setError(`${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookForm
      isAdmin={true}
      authors={authors}
      onSubmit={handleUpload}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
    />
  );
}
