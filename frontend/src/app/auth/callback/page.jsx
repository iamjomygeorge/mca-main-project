"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";
import { Icons } from "@/components/Icons";
import logger from "@/utils/logger";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      logger.error("OAuth Callback Error:", error);
      router.replace(`/login?error=${error}`);
    } else if (token) {
      logger.info("OAuth Callback: Token received, processing login...");
      login(token);
    } else {
      logger.error(
        "OAuth Callback Error: No token or error parameter found in URL."
      );
      router.replace("/login?error=unknown_callback_error");
    }
  }, [searchParams, router, login]);

  return (
    <Container className="flex flex-col items-center justify-center min-h-[60vh] text-center py-12">
      <Icons.spinner className="h-8 w-8 text-zinc-500 mb-4" />
      <p className="text-zinc-600 dark:text-zinc-400">
        Processing authentication, please wait...
      </p>
    </Container>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container className="flex items-center justify-center min-h-[60vh] py-12">
          <p>Loading...</p>
        </Container>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
