import Container from "./Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <Container className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>&copy; {currentYear} Inkling. All Rights Reserved.</p>
      </Container>
    </footer>
  );
}