import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <Container className="py-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/about"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/faq"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/terms"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            Privacy Policy
          </Link>
        </nav>
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {currentYear} Inkling. All Rights Reserved.
        </p>
      </Container>
    </footer>
  );
}