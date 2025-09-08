export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>&copy; {currentYear} Inkling. All Rights Reserved.</p>
      </div>
    </footer>
  );
}