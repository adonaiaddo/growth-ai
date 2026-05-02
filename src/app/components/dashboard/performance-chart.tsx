"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MetaInsightsTimeSeries } from "@/lib/meta/types";
import { formatDateShort, formatCurrency, formatCompact, formatPercent } from "@/lib/format";

interface PerformanceChartProps {
  timeSeries: MetaInsightsTimeSeries[];
}

type MetricKey = "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "reach";

const METRICS: { key: MetricKey; label: string; format: (v: number) => string; color: string }[] = [
  { key: "spend", label: "Spend", format: (v) => formatCurrency(v), color: "#8b5cf6" },
  { key: "impressions", label: "Impressions", format: (v) => formatCompact(v), color: "#3b82f6" },
  { key: "clicks", label: "Clicks", format: (v) => formatCompact(v), color: "#06b6d4" },
  { key: "ctr", label: "CTR", format: (v) => formatPercent(v), color: "#10b981" },
  { key: "cpc", label: "CPC", format: (v) => formatCurrency(v), color: "#f59e0b" },
  { key: "reach", label: "Reach", format: (v) => formatCompact(v), color: "#ec4899" },
];

export function PerformanceChart({ timeSeries }: PerformanceChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("spend");

  if (!timeSeries.length) {
    return (
      <div className="glass rounded-xl p-6 flex items-center justify-center h-[300px]">
        <p className="text-foreground-muted text-sm">No time series data available</p>
      </div>
    );
  }

  const metric = METRICS.find((m) => m.key === activeMetric)!;

  const chartData = timeSeries.map((row) => ({
    date: formatDateShort(row.date_start),
    value: parseFloat(row[activeMetric] || "0"),
  }));

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-1 overflow-x-auto">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMetric === m.key
                ? "bg-white/[0.08] text-foreground"
                : "text-foreground-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8888a0", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            />
            <YAxis
              tick={{ fill: "#8888a0", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => metric.format(v)}
              width={65}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#e4e4ed",
                fontSize: "12px",
              }}
              formatter={(value) => [metric.format(Number(value ?? 0)), metric.label]}
              labelStyle={{ color: "#8888a0" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
