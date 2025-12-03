import Container from "@/components/Container";
import BookCard from "@/components/BookCard";

async function getBooks() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/api/books`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }

  return res.json();
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">
        Browse the Library
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
        {books.length > 0 ? (
          books.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">
            No books have been published yet.
          </p>
        )}
      </div>
    </Container>
  );
}
