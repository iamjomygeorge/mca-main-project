import { Icons } from "@/components/Icons";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Icons.spinner className="h-10 w-10 text-zinc-400 animate-spin" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
