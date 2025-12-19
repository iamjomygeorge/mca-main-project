import { format } from "date-fns";

export default function RecentTransactions({ transactions = [] }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Transactions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Book</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No recent transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="bg-white dark:bg-transparent border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-xs">
                        {tx.user_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {tx.user_name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {tx.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-center gap-3">
                      {tx.cover_image_url && (
                        <img
                          src={tx.cover_image_url}
                          alt=""
                          className="w-8 h-10 object-cover rounded shadow-sm border border-zinc-200 dark:border-zinc-700"
                        />
                      )}
                      <span
                        className="truncate max-w-[200px]"
                        title={tx.book_title}
                      >
                        {tx.book_title || "Deleted Book"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    ₹{tx.purchase_price}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {format(new Date(tx.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
