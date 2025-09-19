"use client";

import { useAuth } from '@/context/AuthContext';
import Container from '@/components/Container';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      } else {
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <Container className="py-12"><p>Verifying permissions...</p></Container>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null; 
  }

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Admin Dashboard</h1>
    </Container>
  );
}