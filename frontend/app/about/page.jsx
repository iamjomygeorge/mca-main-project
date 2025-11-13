import Container from "@/components/Container";

export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          About Inkling
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The Standard for Digital Literary Assets.
        </p>
      </div>
      <div className="max-w-3xl mx-auto mt-16 space-y-12 text-justify">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Inkling is a blockchain-based platform designed to establish trust,
            ownership, and provenance in the digital publishing industry.
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Our project's goal is to create a decentralized literary marketplace
            that guarantees the authenticity and ownership of digital assets.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Inkling functions in two primary ways:
          </p>
          <ul className="list-disc list-inside space-y-4 text-lg text-zinc-700 dark:text-zinc-300">
            <strong>For Authors:</strong> A platform for authors to secure their
            work on an immutable ledger, ensuring verifiable ownership and
            authenticity. Authors can register, upload their EPUB files, and set
            their price.<br></br>
            <strong>For Readers:</strong> A digital library where readers can
            purchase, own, and read verifiable literary works. Once purchased,
            books are added to their personal "My Library" page for reading
            anytime.
          </ul>
        </div>
      </div>
    </Container>
  );
}