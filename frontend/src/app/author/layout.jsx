"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthorSidebar from "@/components/AuthorSidebar";
import Container from "@/components/Container";
import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/Icons";

export default function AuthorLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "AUTHOR") {
        router.push("/login?redirect=/author");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Container className="py-12 flex justify-center">
        <Icons.spinner className="h-8 w-8 text-zinc-500 animate-spin" />
      </Container>
    );
  }

  if (!user || user.role !== "AUTHOR") {
    return null;
  }

  return (
    <DashboardLayout sidebar={<AuthorSidebar />} title="Author Panel">
      {children}
    </DashboardLayout>
  );
}
