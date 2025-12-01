"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";
import Container from "@/components/Container";
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
    <Container className="py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-56">
          <div className="md:sticky md:top-24">
            <h2 className="text-lg font-semibold mb-4 pl-3">Control Panel</h2>
            <AdminSidebar />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </Container>
  );
}
