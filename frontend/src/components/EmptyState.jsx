export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
      {Icon && <Icon className="mx-auto h-12 w-12 text-zinc-400" />}
      <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
