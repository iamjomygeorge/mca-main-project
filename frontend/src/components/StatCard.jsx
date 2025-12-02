import Skeleton from "@/components/Skeleton";

export default function StatCard({ title, value, icon: Icon, loading }) {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
        {Icon && <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />}
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
}
