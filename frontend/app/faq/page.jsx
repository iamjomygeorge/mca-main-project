import Container from "@/components/Container";

const faqs = [
  {
    question: "What is Inkling?",
    answer:
      "Inkling is a blockchain-based platform for authors and readers. It allows authors to secure their work on an immutable ledger and provides a digital library where readers can own and read verifiable literary works.",
  },
  {
    question: "How do I become an author?",
    answer:
      "You can sign up by clicking 'Sign Up' and choosing the 'Become an Author' option. Author accounts require a username and password and have access to an Author Dashboard to upload their books.",
  },
  {
    question: "How do I read a book I've purchased?",
    answer:
      "After purchasing a book, it is added to your 'My Library' page. You can click on the book from there to open it in our web-based reader.",
  },
  {
    question: "What format are the books in?",
    answer:
      "Authors and admins upload books in the EPUB format. Our reader is designed to display these EPUB files directly in your browser.",
  },
  {
    question: "How do I pay for books?",
    answer:
      "We use Stripe to process payments securely. You can buy books using a credit or debit card.",
  },
  {
    question: "Can I sign in with Google?",
    answer:
      "Yes, readers can sign up and log in using their Google account. Author and Admin accounts must use email and password for security.",
  },
];

export default function FAQPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl">
          Frequently Asked Questions
        </h1>
        <div className="mt-16 space-y-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg"
            >
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {faq.question}
              </h3>
              <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
