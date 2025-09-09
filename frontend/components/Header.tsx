import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Inkling Logo" width={32} height={32} className="h-8 w-8"/>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Inkling</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}