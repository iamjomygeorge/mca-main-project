"use client";

import RoleProtectedLayout from "@/components/RoleProtectedLayout";
import AuthorSidebar from "@/components/AuthorSidebar";
import DashboardLayout from "@/components/DashboardLayout";

export default function AuthorLayout({ children }) {
  return (
    <RoleProtectedLayout requiredRole="AUTHOR" redirectPath="/author">
      <DashboardLayout sidebar={<AuthorSidebar />} title="Author Panel">
        {children}
      </DashboardLayout>
    </RoleProtectedLayout>
  );
}
