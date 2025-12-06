"use client";

import RoleProtectedLayout from "@/components/RoleProtectedLayout";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminLayout({ children }) {
  return (
    <RoleProtectedLayout requiredRole="ADMIN" redirectPath="/admin">
      <DashboardLayout sidebar={<AdminSidebar />} title="Control Panel">
        {children}
      </DashboardLayout>
    </RoleProtectedLayout>
  );
}
