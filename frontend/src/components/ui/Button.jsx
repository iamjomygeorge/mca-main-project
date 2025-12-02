import { Icons } from "@/components/Icons";

export function Button({
  children,
  isLoading,
  disabled,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 dark:disabled:bg-sky-500/50 transition-colors duration-200 ${className}`}
      {...props}
    >
      {isLoading ? <Icons.spinner className="h-5 w-5" /> : props.icon}
      {children}
    </button>
  );
}
