"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";
import { Icons } from "@/components/Icons";

export default function RoleProtectedLayout({
  children,
  requiredRole,
  redirectPath,
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== requiredRole) {
        const loginUrl = `/login?redirect=${redirectPath || "/"}`;
        router.push(loginUrl);
      }
    }
  }, [user, loading, router, requiredRole, redirectPath]);

  if (loading) {
    return (
      <Container className="py-12 flex justify-center">
        <Icons.spinner className="h-8 w-8 text-zinc-500 animate-spin" />
      </Container>
    );
  }

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
