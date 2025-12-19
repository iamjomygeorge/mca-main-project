"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function AnalyticsChart({
  title,
  data,
  dataKey = "value",
  color = "#2563eb",
  valuePrefix = "",
}) {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
        {title}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`color-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E4E4E7"
              className="dark:stroke-zinc-800"
            />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${valuePrefix}${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              formatter={(value) => [`${valuePrefix}${value}`, title]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
