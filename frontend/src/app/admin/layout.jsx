"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";
import Container from "@/components/Container";
import DashboardLayout from "@/components/DashboardLayout";
import { Icons } from "@/components/Icons";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/login?redirect=/admin");
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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Control Panel">
      {children}
    </DashboardLayout>
  );
}
