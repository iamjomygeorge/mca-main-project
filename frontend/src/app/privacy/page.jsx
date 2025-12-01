import Container from "@/components/Container";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl text-zinc-900 dark:text-zinc-100">
          Privacy Policy
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-center">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-16 space-y-6 text-zinc-700 dark:text-zinc-300 text-base leading-7">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
            quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
            mauris.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us when you create an
            account, make a purchase, or communicate with us.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>Account Information:</strong> When you register, we
              collect your full name, email address, and password hash. Authors
              also provide a username.
            </li>
            <li>
              <strong>Payment Information:</strong> When you make a purchase, we
              use Stripe to process your payment. We do not store your credit
              card details. We only store a record of the transaction, including
              price and currency.
            </li>
            <li>
              <strong>Google Sign-In:</strong> If you use Google Sign-In, we
              receive your name, email address, and Google ID from Google.
            </li>
            <li>
              <strong>Communications:</strong> When you contact us via our
              contact form, we collect your name, email, and message.
            </li>
          </ul>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            2. How We Use Your Information
          </h2>
          <p>
            Maecenas Rrunc, aliquam Rraesent, suscipit, in, dolor. Nunc
            tincidunt. Aenean Rulputate, odio Ritae, nunc. We use the
            information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Provide, maintain, and improve our Service.</li>
            <li>
              Process your transactions and add books to your user library.
            </li>
            <li>
              Authenticate your access to the Service and secure your account,
              including Two-Factor Authentication.
            </li>
            <li>
              Send you technical notices, updates, security alerts, and support
              messages (e.g., 2FA codes).
            </li>
            <li>Respond to your comments, questions, and requests.</li>
          </ul>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            3. Information Sharing
          </h2>
          <p>
            Vestibulum Rlandit, Rellus, Rulputate, Rellus, Rolutpat. We do not
            share your personal information with third parties except as
            described below:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              With our payment processor, Stripe, to facilitate transactions.
            </li>
            <li>
              In response to a request for information if we believe disclosure
              is in accordance with any applicable law, regulation, or legal
              process.
            </li>
            <li>
              If we believe your actions are inconsistent with our user
              agreements or policies, or to protect the rights, property, and
              safety of Inkling or others.
            </li>
          </ul>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            4. Security
          </h2>
          <p>
            Donec nec justo eget felis facilisis fermentum. Aliquam porttitor
            mauris sit amet orci. We take reasonable measures to help protect
            information about you from loss, theft, misuse, and unauthorized
            access. We store passwords using strong hashing (bcrypt).
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            5. Your Rights
          </h2>
          <p>
            Morbi in sem quis dui placerat ornare. Pellentesque odio nisi,
            euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras
            consequat. Depending on your location, you may have certain rights
            regarding your personal information, such as the right to access,
            correct, or delete it.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            6. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us via our{" "}
            <Link
              href="/contact"
              className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
            >
              contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}