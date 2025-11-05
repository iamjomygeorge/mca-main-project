import Container from "@/components/Container";
import Link from "next/link";

export default function TermsPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-6xl text-zinc-900 dark:text-zinc-100">
          Terms of Service
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
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Inkling platform ("Service"), you agree to
            be bound by these Terms of Service ("Terms"). If you disagree with
            any part of the terms, then you may not access the Service.
          </p>
          <p>
            Vestibulum Rlandit, Rellus, Rulputate, Rellus, Rolutpat, Rellus,
            Rulputate, Rellus, Rolutpat. Quisque Ritae Rlandit Rellus.
            Pellentesque Rarius Rulputate.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            2. User Accounts
          </h2>
          <p>
            Maecenas Rrunc, aliquam Rraesent, suscipit, in, dolor. Nunc
            tincidunt. Aenean Rulputate, odio Ritae, nunc. Ut Rulputate Rarius,
            eu Rulputate Rellus, Rulputate.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              You must provide accurate and complete information when creating
              an account.
            </li>
            <li>
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password.
            </li>
            <li>
              You agree not to disclose your password to any third party. You
              must notify us immediately upon becoming aware of any breach of
              security or unauthorized use of your account.
            </li>
          </ul>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            3. Author Content and Ownership
          </h2>
          <p>
            Authors retain all rights to their literary works ("Content")
            uploaded to the Service. By uploading Content, you grant Inkling a
            non-exclusive, worldwide license to display, sell, and distribute
            your Content through the platform.
          </p>
          <p>
            Vestibulum Rlandit, Rellus, Rulputate, Rellus, Rolutpat, Rellus,
            Rulputate, Rellus, Rolutpat. Quisque Ritae Rlandit Rellus.
            Pellentesque Rarius Rulputate.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            4. Purchases and Payments
          </h2>
          <p>
            Donec nec justo eget felis facilisis fermentum. Aliquam porttitor
            mauris sit amet orci. Aenean dignissim pellentesque felis. Users
            agree to pay all fees for purchases made on the Service. All sales
            are final and non-refundable except as required by law.
          </p>
          <p>
            Payments are processed via our third-party payment processor,
            Stripe. Your use of the payment services is subject to Stripe's
            terms and conditions.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            5. Intellectual Property
          </h2>
          <p>
            The Service and its original content (excluding Content provided by
            users), features, and functionality are and will remain the
            exclusive property of Inkling and its licensors.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            6. Termination
          </h2>
          <p>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            7. Limitation of Liability
          </h2>
          <p>
            Morbi in sem quis dui placerat ornare. Pellentesque odio nisi,
            euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras
            consequat. In no event shall Inkling, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            8. Governing Law
          </h2>
          <p>
            Praesent Rlandit, Rellus, Rulputate, Rellus, Rolutpat, Rellus,
            Rulputate, Rellus, Rolutpat. Quisque Ritae Rlandit Rellus. These
            Terms shall be governed and construed in accordance with the laws,
            without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            9. Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will provide at least 30 days' notice
            prior to any new terms taking effect.
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            10. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us via
            our{" "}
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