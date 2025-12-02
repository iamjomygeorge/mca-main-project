"use client";
import { Icons } from "./Icons";
import DashboardSidebar from "./DashboardSidebar";

const navLinks = [
  { name: "Author Overview", href: "/author", icon: Icons.overview },
  { name: "My Books", href: "/author/my-books", icon: Icons.book },
  { name: "Upload New Book", href: "/author/upload", icon: Icons.upload },
];

export default function AuthorSidebar() {
  return <DashboardSidebar links={navLinks} />;
}
