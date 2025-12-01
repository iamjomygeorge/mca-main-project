"use client";

import { useState } from "react";
import Container from "@/components/Container";
import { Icons } from "@/components/Icons";

const InfoItem = ({ icon: Icon, title, children }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <Icon className="h-9 w-6 text-zinc-900 dark:text-zinc-100" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <div className="text-zinc-600 dark:text-zinc-400">{children}</div>
    </div>
  </div>
);

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const commonInputClasses =
    "block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm";
  const commonLabelClasses =
    "block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        {success ? (
          <div className="mt-12 text-center p-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200">
              Thank You!
            </h3>
            <p className="mt-2 text-lg text-green-700 dark:text-green-300">
              Your message has been received. We'll get back to you soon.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 sm:p-12 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/80">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Get in Touch
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Fill out the form below to send us a message. Our team will
                  review and respond as soon as possible.
                </p>
                <div className="space-y-6">
                  <InfoItem icon={Icons.mapPin} title="Mailing Address">
                    <p>
                      The Quill Building, 42 Literary Lane
                      <br />
                      Novella, BK 10001
                    </p>
                  </InfoItem>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-8 sm:p-12 space-y-6 bg-zinc-50/50 dark:bg-zinc-900/80 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800"
              >
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-500/30">
                    <p className="text-sm text-center font-medium text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className={commonLabelClasses}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={commonInputClasses}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={commonLabelClasses}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={commonInputClasses}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={commonLabelClasses}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className={commonInputClasses}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 dark:disabled:bg-sky-500/50 transition-colors duration-200"
                  >
                    {isLoading ? <Icons.spinner className="h-5 w-5" /> : null}
                    {isLoading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}