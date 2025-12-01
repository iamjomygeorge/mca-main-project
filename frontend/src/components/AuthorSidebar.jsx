"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./Icons";

const navLinks = [
  { name: "Author Overview", href: "/author", icon: Icons.overview },
  { name: "My Books", href: "/author/my-books", icon: Icons.book },
  { name: "Upload New Book", href: "/author/upload", icon: Icons.upload },
];

export default function AuthorSidebar() {
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