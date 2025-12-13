import { Inter, Libre_Baskerville } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { validateEnv } from "@/config/env.validation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre",
});

validateEnv();

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    template: "%s | Inkling",
    default: "Inkling",
  },
  description:
    "A blockchain-based platform for authors to secure their work and a digital library where readers can own and read verifiable literary works.",
  keywords: ["books", "blockchain", "reading", "digital assets", "publishing"],
  authors: [{ name: "Inkling Team" }],
  openGraph: {
    title: "Inkling",
    description: "The Standard for Digital Literary Assets",
    url: "/",
    siteName: "Inkling",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inkling",
    description: "The Standard for Digital Literary Assets",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${libreBaskerville.variable} font-sans flex flex-col min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
