export function Input({ label, error, className = "", id, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id || props.name}
          className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 mb-1"
        >
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id || props.name}
        className="block w-full appearance-none rounded-md border-2 border-neutral-200 px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-neutral-400 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm disabled:opacity-50"
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
