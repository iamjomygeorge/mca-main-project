"use client";
import { Icons } from "./Icons";
import DashboardSidebar from "./DashboardSidebar";

const navLinks = [
  { name: "Overview", href: "/admin", icon: Icons.overview },
  { name: "Users", href: "/admin/users", icon: Icons.users },
  { name: "Authors", href: "/admin/authors", icon: Icons.users },
  { name: "All Books", href: "/admin/books", icon: Icons.book },
  {
    name: "Upload a classic Book",
    href: "/admin/books/upload",
    icon: Icons.upload,
  },
  { name: "Featured Books", href: "/admin/featured-books", icon: Icons.book },
  { name: "Messages", href: "/admin/messages", icon: Icons.mail },
  { name: "Account Settings", href: "/admin/account", icon: Icons.password },
];

export default function AdminSidebar() {
  return <DashboardSidebar links={navLinks} />;
}
