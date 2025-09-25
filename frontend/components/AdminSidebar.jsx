"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./Icons";

const navLinks = [
  { name: "Overview", href: "/admin", icon: Icons.overview },
  {
    name: "Upload a classic Book",
    href: "/admin/books/upload",
    icon: Icons.upload,
  },
  {
    name: "Featured Books",
    href: "/admin/featured-books",
    icon: Icons.book,
  },
  {
    name: "Change Password",
    href: "/admin/change-password",
    icon: Icons.password,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
