import { Suspense } from "react";
import Container from "@/components/Container";
import LoginForm from "@/components/LoginForm";
import { Icons } from "@/components/Icons";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <Icons.spinner className="h-8 w-8 text-zinc-500 mb-4 animate-spin" />
      <p className="text-zinc-600 dark:text-zinc-400">Loading form...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Container className="flex items-center justify-center py-12">
      <Suspense fallback={<LoadingFallback />}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}