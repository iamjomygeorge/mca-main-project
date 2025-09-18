"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Container from '@/components/Container';
import EpubReader from '@/components/EpubReader';

export default function BookReaderPage() {
  const params = useParams();
  const { id } = params;

  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchBookData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`);
          if (!response.ok) {
            throw new Error('Book not found');
          }
          const data = await response.json();
          setBookData(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBookData();
    }
  }, [id]);

  if (loading) {
    return <Container className="py-12"><p>Loading book details...</p></Container>;
  }

  if (error) {
    return <Container className="py-12"><p className="text-red-500">Error: {error}</p></Container>;
  }

  if (!bookData) {
    return null;
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold mb-2">{bookData.title}</h1>
      <h2 className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">by {bookData.author_name}</h2>
      
      <div style={{ height: '80vh', position: 'relative' }} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <EpubReader url={bookData.book_file_url} />
      </div>
    </Container>
  );
}